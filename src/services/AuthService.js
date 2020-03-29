import Api from '@/services/BaseApi'

export default {
    signIn () {
        return Api().get('/login');
    },
    isSignedIn() {
        return Api().get('/is-logged');
    },
    getUser() {
        return Api().get('/user');
    },
    signOut () {
        return Api().get('/logout');
    }

}