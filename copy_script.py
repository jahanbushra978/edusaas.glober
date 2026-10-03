import os
import shutil
from pathlib import Path

files_to_copy = [
    (r"E:\aa\rahmanialust\pln\rrr\src\features\applications\engines\applicationService.js", r"E:\aa\rahmanialust\src\features\applications\engines\applicationService.js"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\applications\engines\workflowEngine.js", r"E:\aa\rahmanialust\src\features\applications\engines\workflowEngine.js"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\applications\engines\notificationEngine.js", r"E:\aa\rahmanialust\src\features\applications\engines\notificationEngine.js"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\applications\engines\permissionEngine.js", r"E:\aa\rahmanialust\src\features\applications\engines\permissionEngine.js"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\applications\components\ApplicationForm.jsx", r"E:\aa\rahmanialust\src\features\applications\components\ApplicationForm.jsx"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\applications\components\ApplicationPortal.jsx", r"E:\aa\rahmanialust\src\features\applications\components\ApplicationPortal.jsx"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\applications\components\ApplicationTimeline.jsx", r"E:\aa\rahmanialust\src\features\applications\components\ApplicationTimeline.jsx"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\admin\components\ApplicationManager.jsx", r"E:\aa\rahmanialust\src\features\admin\components\ApplicationManager.jsx"),
    (r"E:\aa\rahmanialust\pln\rrr\src\shared\components\ui-custom\FaviconUpdater.jsx", r"E:\aa\rahmanialust\src\shared\components\ui-custom\FaviconUpdater.jsx"),
    (r"E:\aa\rahmanialust\pln\rrr\app\api\public\admission\route.js", r"E:\aa\rahmanialust\app\api\public\admission\route.js"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\site\components\results\AssignedStudentsResultView.jsx", r"E:\aa\rahmanialust\src\features\site\components\results\AssignedStudentsResultView.jsx"),
    (r"E:\aa\rahmanialust\pln\rrr\src\features\site\components\results\RankingCenter.jsx", r"E:\aa\rahmanialust\src\features\site\components\results\RankingCenter.jsx")
]

for src, dst in files_to_copy:
    print(f"Copying {src} to {dst}")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    print(f"Success: {dst}")
