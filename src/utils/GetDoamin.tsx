//const IS_SERVER = typeof window === "undefined";
//export default function getDomain() {
//    const baseURL = IS_SERVER
//        ? process.env.NEXT_PUBLIC_SITE_URL!
//        : window.location.hostname;
//    return baseURL.toString();
//}

export default function getDomain() {
    const env = process.env.NEXT_PUBLIC_ENVIRONMENT;
    if(env === "local"){
        return "dev.ringingo.com"
    }
    let baseURL = window.location.hostname;
    if(baseURL.includes("-")){
        baseURL = baseURL.split("-")[1]
    }
    return baseURL.toString();
}

