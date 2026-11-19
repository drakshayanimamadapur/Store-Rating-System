
export const getDashboardPath = (role) => {
    switch (role) {
        case "ADMIN":
            return "/admin";

        case "USER":
            return "/user";

        case "STORE_OWNER":
            return "/owner";

        default:
            return "/login";
    }
};
