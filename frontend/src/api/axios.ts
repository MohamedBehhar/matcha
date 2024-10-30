import axios from "axios";

export const getToken = () => localStorage.getItem("access_token");
export const getrefresh_token = () => localStorage.getItem("refresh_token");

const instance = axios.create({
	baseURL: "http://localhost:3000/api",
});

instance.interceptors.request.use(
	(config : any) => {
		config.headers.Authorization = `Bearer ${getToken()}`;
		return config;
	},
	(error:any) => {
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	(response :any) => {
		return response;
	},
	async (error:any) => {
		const originalRequest = error.config;
		if (error?.response?.status === 403) {
			alert("You are not authorized to access this resource");
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			localStorage.removeItem("id");
			window.location.href = "/";
		}
		if (error?.response?.status === 401 && !originalRequest._retry) {
			try {

				const response = await instance.post("/auth/refresh",
					{

						refresh_token: getrefresh_token(),

					}
				);
				if (!response.data.accessToken) {
					alert("No access token provided");
					throw new Error("No access token provided");
				}
				localStorage.setItem("access_token", response.data.accessToken);


				originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;


				originalRequest._retry = true;
				return axios(originalRequest);
			} catch (refreshError) {
				throw refreshError;
			}
		}

		return Promise.reject(error);
	}
);

export default instance;
