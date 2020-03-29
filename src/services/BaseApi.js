import axios from 'axios'

export default() => {
    return axios.create({
        // baseURL: `http://127.0.0.1:8080/api`,
        baseURL: `https://vue-twitter-dashboard.herokuapp.com/api`,
        withCredentials: true,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            Cookie: 'connect.sid=s%3A9p8VTH228tEfOEEzCAksIMWThTlPs03T.HbVbi6NsGeIVmXvlIAKRipfbufH8WWATMwztPs0MMzM'
        }
    })
}