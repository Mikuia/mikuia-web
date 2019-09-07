import {AxiosResponse} from "axios";

import IAuth from "../IAuth";

interface IApiAuthResponse extends AxiosResponse {
	data: IAuth
}

export default IApiAuthResponse;