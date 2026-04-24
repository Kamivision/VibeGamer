// Tests display of game details page and functionality of add/remove library buttons
describe("Game Detail Page", () => {
    it("displays game details and allows adding/removing from library", () => {
    cy.intercept("GET", "**/api/v1/games/rawg/**").as("getGameDetails");

    // Visit a specific game detail page (using a known RAWG game ID)
    cy.visit("/game/3498"); // Example: Grand Theft Auto V

    // Wait for the game details API request to complete
    cy.wait("@getGameDetails").then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const game = interception.response.body;

        // Check that the game title is displayed
        cy.contains(game.name).should("be.visible");

        // Check that the game description is displayed
        cy.contains(game.description_raw.substring(0, 100)).should("be.visible"); // Check a snippet of the description

        // Check ratings block is displayed
        cy.contains(`Rating: ${game.rating}`).should("be.visible");
        cy.contains(`ESRB: ${game.esrb_rating}`).should("be.visible");

        // Check details block is displayed
        cy.contains(`Released: ${game.released}`).should("be.visible");
        cy.contains(`Genres: ${game.genres.map(g => g.name).join(", ")}`).should("be.visible");
        cy.contains(`Platforms: ${game.platforms.map(p => p.platform.name).join(", ")}`).should("be.visible");
        cy.contains(`Where to Play: ${game.stores.map(s => s.store.name).join(", ")}`).should("be.visible");

        // Check that the "Add to Library" button is visible and click it
        cy.contains("Add to Library").should("be.visible").click();

        // Verify that the button changes to "Remove from Library"
        cy.contains("Remove from Library").should("be.visible").click();

        // Verify that the button changes back to "Add to Library"
        cy.contains("Add to Library").should("be.visible");
        });
    });
});