// Test for home page structure and link functionality
const featuredGamesStub = {
    count: 6,
    next: null,
    previous: null,
    results: [
        { id: 101, name: "Skybound Echo", released: "2026-01-10", rating: 4.6, background_image: "", genres: ["Action"], platforms: ["PC"] },
        { id: 102, name: "Iron Tide", released: "2026-02-15", rating: 4.4, background_image: "", genres: ["RPG"], platforms: ["PC"] },
        { id: 103, name: "Nova Runner", released: "2026-03-08", rating: 4.2, background_image: "", genres: ["Indie"], platforms: ["PlayStation 5"] },
        { id: 104, name: "Drift Signal", released: "2026-04-02", rating: 4.3, background_image: "", genres: ["Racing"], platforms: ["Xbox Series X/S"] },
        { id: 105, name: "Myth Circuit", released: "2026-05-19", rating: 4.5, background_image: "", genres: ["Adventure"], platforms: ["Nintendo Switch"] },
        { id: 106, name: "Pixel Forge", released: "2026-06-24", rating: 4.1, background_image: "", genres: ["Strategy"], platforms: ["PC"] },
    ],
};

describe("Home Page", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/api/v1/games/rawg/**", {
            statusCode: 200,
            body: featuredGamesStub,
        }).as("getFeaturedGames");

        cy.visit("/");
        cy.wait("@getFeaturedGames");
    });
    
    it("should display the hero image and subheading", () => {
        cy.get(".hero-image").should("be.visible");
        cy.get(".subheading").should("contain", "Discover Your Next Favorite Game");
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
        cy.contains("Featured Games").should("be.visible");
        cy.contains("Loading games...").should("not.exist");
        cy.contains("No games found.").should("not.exist");
        cy.contains("6 games found").should("be.visible");
        cy.contains("Skybound Echo").should("be.visible");
        cy.contains("Iron Tide").should("be.visible");
        cy.contains("Nova Runner").should("be.visible");
        cy.contains("Drift Signal").should("be.visible");
        cy.contains("Myth Circuit").should("be.visible");
        cy.contains("Pixel Forge").should("be.visible");
    });
});

