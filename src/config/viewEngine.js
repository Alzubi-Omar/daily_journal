import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import { paths } from "./paths.js";

/**
 * Configures the view engine and essential middleware for the Express app.
 *
 * @param {import('express').Application} app
 */
export const configureViewEngine = (app) => {
  app.set("view engine", "ejs");
  app.set("views", paths.views);
  app.set("layout", "layouts/main");

  app.use(expressEjsLayouts);

  app.use(express.static(paths.public));

  // 10kb limit prevents CPU exhaustion via oversized bcrypt payloads
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
};
