// Test for home page structure and link functionality
describe("Home Page", () => {
    beforeEach(() => {
        cy.visit("/");
    });
    
    it("should display the hero image and subheading", () => {
        cy.get(".hero-image").should("be.visible");
        cy.get(".subheading").should("contain", "Discover your next favorite game");
    });

    it("should have a working sign in/sign up button", () => {
        cy.contains("Sign In or Sign Up to Get Started").click();
        cy.url().should("include", "/auth");
    });

    it("should have a working explore new releases link", () => {
        cy.get(".bg-image").should("be.visible");
        cy.contains("Explore New Releases").click();
        cy.url().should("include", "/new");
    });

    it("should have working platform browse buttons", () => {
        const platforms = [
            { name: "PC", path: "/platform/pc" },
            { name: "XBOX Games", path: "/platform/xbox-series-x" },
            { name: "Playstation Games", path: "/platform/playstation5" },
            { name: "Switch Games", path: "/platform/nintendo-switch" },
            { name: "Android Games", path: "/platform/android" },
            { name: "iOS Games", path: "/platform/ios" },
        ];

        platforms.forEach(({ name, path }) => {
            cy.contains(`Browse ${name}`).click();
            cy.url().should("include", path);
            cy.go("back");
        });
    });

    it("should display featured games section", () => {
        //should load exactly 6 games in the featured games section
        cy.contains("Featured Games").should("be.visible");
        cy.get(".home-page .display-games").should("be.visible");
        cy.get(".home-page .display-games .game-card").should("have.length", 6);
    });
});

