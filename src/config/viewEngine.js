import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import { paths } from "./paths.js";

/**
 * Configures the view engine and essential middleware for an Express application.
 * @function configureViewEngine
 * @returns {void}
 * @description
 * - Sets up EJS as the view engine with layouts support
 * - Configures static assets directory
 * - Serve static files  and body parsing
 */
export const configureViewEngine = (app) => {
  app.set("view engine", "ejs");
  app.set("views", paths.views);
  app.set("layout", "layouts/main");

  app.use(expressEjsLayouts);

  app.use(express.static(paths.public));
  app.use(express.urlencoded({ extended: true }));
};
