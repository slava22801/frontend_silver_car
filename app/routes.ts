import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/cars", "routes/cars.tsx"),
    route("/admin", "routes/admin.tsx"),
    route("/about/:id", "routes/about.tsx"),
    route("/login", "routes/login.tsx"),
    route("/profile", "routes/profile.tsx"),
    route("/aboutus", "routes/aboutUs.tsx"),
    route("/manager", "routes/manager.tsx")
] satisfies RouteConfig;
