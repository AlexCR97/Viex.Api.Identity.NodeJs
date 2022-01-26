import express from "express";
import GoogleController from "./Google.controller.js";

/**
 * @param {express.Express} app 
 */
export default function(app) {
    GoogleController(app)
}
