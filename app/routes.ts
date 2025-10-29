import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/cars", "routes/cars.tsx"),
    route("/admin", "routes/admin.tsx")
] satisfies RouteConfig;
