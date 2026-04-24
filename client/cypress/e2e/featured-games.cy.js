// Integration test: verifies that featured games are actually fetched from the
// RAWG API through the full stack (nginx → Django → RAWG).
//
// This test visits the nginx Docker host (port 80) instead of the Vite dev
// server (port 5173) because only nginx has the /api/ → backend proxy.
// Run this test when you want to validate the live connection to RAWG, not for
// fast CI runs (use home.cy.js for the stubbed version).

describe("Featured Games — live RAWG integration", () => {
    it("fetches 6 featured games from RAWG and displays them on the home page", () => {
        // Spy on the real API request so we can wait for it and inspect its
        // response body. No stub is provided, so the request goes all the way
        // through Django to RAWG.
        cy.intercept("GET", "**/api/v1/games/rawg/**").as("getFeaturedGames");

        // Visit the nginx-served app so the /api/ proxy is active.
        cy.visit("http://localhost/");

        // Wait for the featured-games request to complete and capture the
        // response so we can assert the data before checking the DOM.
        cy.wait("@getFeaturedGames", { timeout: 15000 }).then((interception) => {
            // Confirm the backend returned a successful response.
            expect(interception.response.statusCode).to.eq(200);

            const body = interception.response.body;

            // The response must have a results array with exactly 6 entries
            // (matching the page_size=6 requested by fetchFeaturedGames).
            expect(body.results).to.be.an("array");
            expect(body.results).to.have.length(6);

            // Every result must have at least an id and a name so the UI can
            // render the game cards.
            body.results.forEach((game) => {
                expect(game).to.have.property("id").that.is.a("number");
                expect(game).to.have.property("name").that.is.a("string").and.not.empty;
            });
        });

        // After the request resolves the loading state should be gone and the
        // section heading visible.
        cy.contains("Loading games...").should("not.exist");
        cy.contains("Featured Games").should("be.visible");

        // The count badge should reflect the real total returned by RAWG.
        cy.contains(/\d+ games found/).should("be.visible");

        // There should be exactly 6 game cards rendered (one per result).
        // GameCard is a Material Tailwind <Card> — each renders an <img> with
        // the game name as its alt text, which is a stable content assertion
        // that doesn't depend on CSS class names.
        cy.get(".home-page")
            .find("img[alt]")
            .filter((_, el) => el.alt.length > 0)
            .should("have.length", 6);
    });
});
