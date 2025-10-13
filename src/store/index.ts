import {createStore} from "vuex";
import {Article} from "@/interfaces/Article";

export default createStore({
    state: {
        selectedArticle: null as Article | null,
    },
    mutations: {
        setSelectedArticle(state, article: Article) {
            state.selectedArticle = article;
        },
    },
    actions: {
        selectArticle({commit}, article: Article) {
            commit('setSelectedArticle', article);
        },
    },
    getters: {
        selectedArticle: state => state.selectedArticle,
    },
});