import axios from 'axios'
import { API_TIMEOUT } from '../config/index.mjs'
const axiosInstance = axios.create({
  timeout: API_TIMEOUT,
  method: 'get',
})

export default axiosInstance
