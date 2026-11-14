#!/usr/bin/env bash
# Smoke/integration test against a running server (default http://localhost:3100) seeded with prisma/seed.ts
B=${BASE:-http://localhost:3100}; J='content-type: application/json'; PASS=0; FAIL=0
ok(){ if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "  ok   $1"; else FAIL=$((FAIL+1)); echo "  FAIL $1 (got '$2', want '$3')"; fi; }
login(){ curl -s -c /tmp/jar_$1 -X POST -H "$J" -d "{\"mosqueSlug\":\"baitun-noor\",\"loginId\":\"$1\",\"password\":\"Mosque@12345\"}" $B/api/auth/login >/dev/null; }
code(){ curl -s -o /dev/null -w '%{http_code}' "$@"; }
js(){ python3 -c "import sys,json;d=json.load(sys.stdin);print($1)"; }
login treasurer; login president; login member01
ok "no session -> 401" "$(code $B/api/dashboard)" 401
ok "wrong password -> 401" "$(code -X POST -H "$J" -d '{"mosqueSlug":"baitun-noor","loginId":"member01","password":"nope"}' $B/api/auth/login)" 401
MID=$(curl -s -b /tmp/jar_member01 $B/api/members/me | js "d['member']['id']")
ok "member sees own statement" "$(curl -s -b /tmp/jar_member01 $B/api/members/me | js "len(d['months'])>0")" True
P1=$(curl -s -b /tmp/jar_member01 "$B/api/months/2026-10?filter=all")
N1=$(echo "$P1" | js "len(d['items'])"); CUR=$(echo "$P1" | js "d['nextCursor']")
P2=$(curl -s -b /tmp/jar_member01 "$B/api/months/2026-10?filter=all&cursor=$CUR")
ok "infinite list page 1 is full (20)" "$N1" 20
ok "page 2 has no overlap with page 1" "$(python3 - "$P1" "$P2" <<'PY'
import sys,json
a={i['id'] for i in json.loads(sys.argv[1])['items']}; b={i['id'] for i in json.loads(sys.argv[2])['items']}
print(len(a&b)==0 and len(b)>0)
PY
)" True
ok "member cannot record payment -> 403" "$(code -X POST -b /tmp/jar_member01 -H "$J" -d "{\"membershipId\":\"$MID\",\"period\":\"2026-10\",\"amount\":100,\"method\":\"CASH\",\"idempotencyKey\":\"member-try-1\"}" $B/api/payments)" 403
KEY="it-$(date +%s%N)"
R1=$(curl -s -X POST -b /tmp/jar_treasurer -H "$J" -d "{\"membershipId\":\"$MID\",\"period\":\"2026-10\",\"amount\":100,\"method\":\"BKASH\",\"idempotencyKey\":\"$KEY\"}" $B/api/payments)
R2=$(curl -s -X POST -b /tmp/jar_treasurer -H "$J" -d "{\"membershipId\":\"$MID\",\"period\":\"2026-10\",\"amount\":100,\"method\":\"BKASH\",\"idempotencyKey\":\"$KEY\"}" $B/api/payments)
ok "first payment not duplicate" "$(echo "$R1" | js "d['duplicate']")" False
ok "retry returns same receipt" "$(python3 - "$R1" "$R2" <<'PY'
import sys,json
a,b=json.loads(sys.argv[1]),json.loads(sys.argv[2]); print(a['receiptNo']==b['receiptNo'] and b['duplicate'])
PY
)" True
RK="race-$(date +%s%N)"
for i in 1 2 3 4 5; do curl -s -o /dev/null -X POST -b /tmp/jar_treasurer -H "$J" -d "{\"membershipId\":\"$MID\",\"period\":\"2026-10\",\"amount\":50,\"method\":\"CASH\",\"idempotencyKey\":\"$RK\"}" $B/api/payments & done; wait
ok "5 parallel same-key requests -> 1 row" "$(su postgres -c "psql -d mosque -tAc \"select count(*) from \\\"Payment\\\" where \\\"idempotencyKey\\\"='$RK'\"")" 1
ok "future month rejected -> 400" "$(code -X POST -b /tmp/jar_treasurer -H "$J" -d "{\"membershipId\":\"$MID\",\"period\":\"2027-05\",\"amount\":50,\"method\":\"CASH\",\"idempotencyKey\":\"future-$KEY\"}" $B/api/payments)" 400
ok "non-JSON write -> 415" "$(code -X POST -b /tmp/jar_treasurer -d 'x=1' $B/api/payments)" 415
ok "member cannot PATCH member -> 403" "$(code -X PATCH -b /tmp/jar_member01 -H "$J" -d '{"monthlyPledge":1}' $B/api/members/$MID)" 403
ok "president can change pledge" "$(code -X PATCH -b /tmp/jar_president -H "$J" -d '{"monthlyPledge":700}' $B/api/members/$MID)" 200
ok "current month due follows new pledge" "$(curl -s -b /tmp/jar_member01 $B/api/members/me | js "d['months'][0]['due']")" 700
ok "past month due unchanged" "$(curl -s -b /tmp/jar_member01 $B/api/members/me | js "d['months'][1]['due']!=700")" True
NEW="new$(date +%s)"
ok "register -> 200" "$(code -c /tmp/jar_new -X POST -H "$J" -d "{\"mosqueSlug\":\"baitun-noor\",\"name\":\"Test Person\",\"loginId\":\"$NEW\",\"password\":\"longpassword1\"}" $B/api/auth/register)" 200
ok "pending member blocked from dashboard -> 403" "$(code -b /tmp/jar_new $B/api/dashboard)" 403
ok "pending member sees /me" "$(curl -s -b /tmp/jar_new $B/api/me | js "d['status']")" PENDING
ok "duplicate login id -> 409" "$(code -X POST -H "$J" -d "{\"mosqueSlug\":\"baitun-noor\",\"name\":\"X Y\",\"loginId\":\"$NEW\",\"password\":\"longpassword1\"}" $B/api/auth/register)" 409
NID=$(curl -s -b /tmp/jar_new $B/api/me | js "d['membershipId']")
ok "president verifies member" "$(code -X PATCH -b /tmp/jar_president -H "$J" -d '{"status":"ACTIVE","monthlyPledge":300}' $B/api/members/$NID)" 200
ok "verified member can open dashboard" "$(code -b /tmp/jar_new $B/api/dashboard)" 200
ok "new member gets a due row for this month" "$(curl -s -b /tmp/jar_new $B/api/members/me | js "len(d['months'])")" 1
ok "audit rows written" "$(su postgres -c "psql -d mosque -tAc \"select count(*)>=3 from \\\"AuditLog\\\"\"")" t

# ---------- Phase 3: expenses, approval, reminders ----------
SQL(){ echo "$1" | su postgres -c "psql -d mosque -tA" 2>&1; }
newexp(){ curl -s -X POST -b /tmp/jar_$1 -H "$J" -d "{\"category\":\"MAINTENANCE\",\"description\":\"$2\",\"amount\":$3,\"spentAt\":\"2026-10-10\"}" $B/api/expenses | js "d['id']"; }
decide(){ code -X POST -b /tmp/jar_$1 -H "$J" -d "$3" $B/api/expenses/$2/decision; }
E1=$(newexp treasurer "Fan repair" 5000)
ok "treasurer submits expense" "$(SQL "select status from \"Expense\" where id='$E1'")" PENDING_APPROVAL
ok "president got an approval notification" "$(curl -s -b /tmp/jar_president $B/api/notifications | js "any(n['kind']=='APPROVAL_REQUEST' for n in d['items'])")" True
ok "member cannot submit expense -> 403" "$(code -X POST -b /tmp/jar_member01 -H "$J" -d '{"category":"OTHER","description":"abc","amount":10,"spentAt":"2026-10-10"}' $B/api/expenses)" 403
ok "member cannot see pending expense -> 404" "$(code -b /tmp/jar_member01 $B/api/expenses/$E1)" 404
ok "member list hides pending" "$(curl -s -b /tmp/jar_member01 "$B/api/expenses" | js "all(i['status'] in ('APPROVED','PAID','REVERSED') for i in d['items'])")" True
ok "treasurer cannot approve (no permission) -> 403" "$(decide treasurer $E1 '{"decision":"APPROVE"}')" 403
ok "reject without reason -> 400" "$(decide president $E1 '{"decision":"REJECT"}')" 400
PE=$(newexp president "Own expense" 1000)
ok "self-approval blocked -> 403" "$(decide president $PE '{"decision":"APPROVE"}')" 403
ok "president approves treasurer expense" "$(decide president $E1 '{"decision":"APPROVE"}')" 200
ok "second decision rejected -> 409" "$(decide president $E1 '{"decision":"REJECT","reason":"too late"}')" 409
ok "decision recorded with decider + time" "$(SQL "select count(*) from \"Expense\" where id='$E1' and \"decidedById\" is not null and \"decidedAt\" is not null")" 1
ok "submitter notified of approval" "$(curl -s -b /tmp/jar_treasurer $B/api/notifications | js "any(n['kind']=='EXPENSE_APPROVED' for n in d['items'])")" True
ok "member cannot pay -> 403" "$(code -X POST -b /tmp/jar_member01 -H "$J" -d '{}' $B/api/expenses/$E1/pay)" 403
ok "treasurer marks paid" "$(code -X POST -b /tmp/jar_treasurer -H "$J" -d '{"paymentRef":"BK-1"}' $B/api/expenses/$E1/pay)" 200
ok "paid expense now public to members" "$(code -b /tmp/jar_member01 $B/api/expenses/$E1)" 200
BIG=$(newexp treasurer "Huge purchase" 90000000); decide president $BIG '{"decision":"APPROVE"}' >/dev/null
ok "payment beyond fund balance -> 409" "$(code -X POST -b /tmp/jar_treasurer -H "$J" -d '{}' $B/api/expenses/$BIG/pay)" 409
ok "posted expense cannot be deleted (DB)" "$(SQL "delete from \"Expense\" where id='$E1'" 2>&1 | grep -c 'cannot be deleted')" 1
ok "audit trail for expense" "$(SQL "select count(*) from \"AuditLog\" where entity='Expense' and \"entityId\"='$E1'")" 3

CS=${CRON_SECRET:-cron-secret-for-tests-123}
cron(){ curl -s -X POST -H "Authorization: Bearer $CS" -H "$J" -d '{}' $B/api/cron/reminders; }
ok "cron without secret -> 401" "$(code -X POST -H "$J" -d '{}' $B/api/cron/reminders)" 401
E2=$(newexp treasurer "Light repair" 3000)
ok "step 0 recorded at submission" "$(SQL "select count(*) from \"ReminderEvent\" where \"expenseId\"='$E2' and step=0")" 1
cron >/dev/null
ok "nothing extra before 2h" "$(SQL "select count(*) from \"ReminderEvent\" where \"expenseId\"='$E2'")" 1
SQL "update \"Expense\" set \"submittedAt\"=now()-interval '3 hours' where id='$E2'" >/dev/null
cron >/dev/null; cron >/dev/null
ok "2h reminder fired once despite two runs" "$(SQL "select count(*) from \"ReminderEvent\" where \"expenseId\"='$E2' and step=1")" 1
ok "6h reminder not yet" "$(SQL "select count(*) from \"ReminderEvent\" where \"expenseId\"='$E2' and step=2")" 0
SQL "update \"Expense\" set \"submittedAt\"=now()-interval '50 hours' where id='$E2'" >/dev/null
for i in 1 2 3; do cron >/dev/null & done; wait
ok "parallel cron: each of 5 steps exactly once" "$(SQL "select count(*)||'/'||count(distinct step) from \"ReminderEvent\" where \"expenseId\"='$E2'")" "5/5"
ok "overdue flag set, NOT approved" "$(SQL "select (\"overdueAt\" is not null)||'/'||status from \"Expense\" where id='$E2'")" "true/PENDING_APPROVAL"
ok "escalation reached president" "$(curl -s -b /tmp/jar_president $B/api/notifications | js "any(n['kind']=='APPROVAL_OVERDUE' for n in d['items'])")" True
ok "submitter is never a recipient of own request" "$(SQL "select count(*) from \"Notification\" n join \"User\" u on u.id=n.\"userId\" where u.\"loginId\"='treasurer' and n.kind like 'APPROVAL_%'")" 0
decide president $E2 '{"decision":"REJECT","reason":"Not needed now"}' >/dev/null
BEFORE=$(SQL "select count(*) from \"Notification\" where kind like 'APPROVAL_%'")
SQL "delete from \"ReminderEvent\" where \"expenseId\"='$E2' and step>=2" >/dev/null
cron >/dev/null
ok "no reminders after rejection" "$(SQL "select count(*) from \"Notification\" where kind like 'APPROVAL_%'")" "$BEFORE"

# ---------- receipts + fund detail ----------
PID=$(SQL "select id from \"Payment\" where \"membershipId\"='$MID' order by \"createdAt\" limit 1")
ok "member opens own receipt" "$(code -b /tmp/jar_member01 $B/api/receipts/$PID)" 200
login member02
ok "other member cannot open it -> 404" "$(code -b /tmp/jar_member02 $B/api/receipts/$PID)" 404
FID=$(SQL "select id from \"Fund\" where \"isMonthly\"=true limit 1")
ok "fund detail has months" "$(curl -s -b /tmp/jar_member01 $B/api/funds/$FID | js "len(d['months'])>0")" True

# ---------- dynamic mosque, roles, lockout ----------
SLUG="it-$(date +%s)"; JAR=/tmp/jar_newadmin; ADM="adm$(date +%s)"
ok "create mosque -> 200" "$(code -c $JAR -X POST -H "$J" -d "{\"mosqueName\":\"Test Mosque\",\"mosqueSlug\":\"$SLUG\",\"name\":\"Admin One\",\"loginId\":\"$ADM\",\"password\":\"Passw0rd!x\"}" $B/api/mosques)" 200
ok "duplicate slug -> 409" "$(code -X POST -H "$J" -d "{\"mosqueName\":\"Other\",\"mosqueSlug\":\"$SLUG\",\"name\":\"X Y\",\"loginId\":\"${ADM}b\",\"password\":\"Passw0rd!x\"}" $B/api/mosques)" 409
ok "new admin is ACTIVE" "$(curl -s -b $JAR $B/api/me | js "d['status']")" ACTIVE
ok "member cannot create role -> 403" "$(code -X POST -b /tmp/jar_member01 -H "$J" -d '{"name":"Hacker","permissions":["roles.manage"]}' $B/api/roles)" 403
ok "admin creates custom role" "$(code -X POST -b $JAR -H "$J" -d '{"name":"Auditor","permissions":["finance.view_all"]}' $B/api/roles)" 200
RID=$(curl -s -b $JAR $B/api/roles | js "[r['id'] for r in d['roles'] if r['key']=='president'][0]")
ok "cannot strip last admin permission -> 409" "$(code -X PATCH -b $JAR -H "$J" -d '{"permissions":[]}' $B/api/roles/$RID)" 409
ok "system role cannot be deleted -> 409" "$(code -X DELETE -b $JAR -H "$J" -d '{}' $B/api/roles/$RID)" 409
OTHER_ROLE=$(SQL "select r.id from \"Role\" r join \"Mosque\" m on m.id=r.\"mosqueId\" where m.slug='baitun-noor' limit 1")
ok "other mosque's role id -> 404" "$(code -X PATCH -b $JAR -H "$J" -d '{"name":"zz"}' "$B/api/roles/$OTHER_ROLE")" 404
ok "settings toggle privacy" "$(code -X PATCH -b $JAR -H "$J" -d '{"showContributors":true}' $B/api/settings)" 200
echo "passed $PASS, failed $FAIL"; [ $FAIL -eq 0 ]
