const isNode = typeof window === "undefined";

function viteOrNextPublic(viteKey) {
  try {
    if (typeof process !== "undefined" && process.env) {
      const nk = viteKey.replace(/^VITE_/, "NEXT_PUBLIC_");
      if (process.env[nk]) return process.env[nk];
    }
  } catch (_) {
    /* no process */
  }
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.[viteKey]) {
      return import.meta.env[viteKey];
    }
  } catch (_) {
    /* no import.meta */
  }
  return undefined;
}

const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `rahmania_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('rahmania_access_token');
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: viteOrNextPublic("VITE_APP_ID") }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: isNode ? "/" : getAppParamValue("from_url", {
			defaultValue: typeof window !== "undefined" ? window.location.href : "/",
		}),
		functionsVersion: getAppParamValue(
			"functions_version",
			{ defaultValue: viteOrNextPublic("VITE_FUNCTIONS_VERSION") },
		),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: viteOrNextPublic("VITE_APP_BASE_URL") }),
	};
}


export const appParams = {
	...getAppParams()
}
