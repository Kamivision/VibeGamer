/* global beforeEach, cy, describe, it */

describe("Auth signup flow", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("creates an account and stores the token", () => {
    const newUser = {
      username: "newplayer",
      email: "newplayer@example.com",
      password: "Test1234!",
    };

    cy.intercept("POST", "**/api/v1/users/create/", (req) => {
      expect(req.body).to.deep.equal(newUser);
      req.reply({
        statusCode: 201,
        body: {
          token: "signup-test-token",
          username: newUser.username,
          email: newUser.email,
        },
      });
    }).as("createUser");

    cy.visit("/auth");

    cy.contains("button", "Don't have an account? Sign Up").click();

    cy.get('input[name="username"]').type(newUser.username);
    cy.get('input[name="email"]').type(newUser.email);
    cy.get('input[name="password"]').type(newUser.password);
    cy.get('input[name="confirmPassword"]').type(newUser.password);

    cy.contains("button", "Sign Up").click();

    cy.wait("@createUser");
    cy.url().should("eq", `${Cypress.config("baseUrl")}`);

    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.eq("signup-test-token");
    });

    cy.contains(newUser.username).should("be.visible");
  });
});
