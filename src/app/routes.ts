import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("projects/:id", "routes/project.$id.tsx"),
    route("submission", "routes/submission.tsx"),
    route("submissions/:id", "routes/submission.$id.tsx"),
    route("evaluate/:id", "routes/evaluate.$id.tsx"),
    route("success", "routes/success.tsx"),
    route("about", "routes/about.tsx"),
    route("faq", "routes/faq.tsx"),
    route("*", "routes/errors/not-found.tsx"),
] satisfies RouteConfig;
