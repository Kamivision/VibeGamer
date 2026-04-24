/* global beforeEach, cy, describe, expect, it */

const authenticatedUser = {
  email: "pixel@example.com",
  username: "pixelplayer",
};

const cozyProfile = {
  personality: "Cozy Explorer",
  play_time_preference: "short",
  personality_tags: ["cozy", "story rich"],
  genre_tags: ["adventure", "indie"],
  platform_tags: ["pc", "switch"],
  excluded_tags: ["horror"],
};

const competitiveProfile = {
  personality: "Competitive Sprinter",
  play_time_preference: "long",
  personality_tags: ["competitive", "fast paced"],
  genre_tags: ["shooter", "action"],
  platform_tags: ["pc", "playstation-5"],
  excluded_tags: ["casual"],
};

function buildGame(id, name, genres, platforms) {
  return {
    id,
    name,
    genres,
    platforms,
    background_image: "https://example.com/game.jpg",
    released: "2024-01-01",
    rating: 4.5,
  };
}

const cozyRecommendations = [
  buildGame(101, "Spiritfarer", ["Adventure", "Indie"], ["PC", "Switch"]),
];

const competitiveRecommendations = [
  buildGame(202, "Apex Legends", ["Shooter", "Action"], ["PC", "PlayStation 5"]),
];

describe("Recommendations page", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("persists add/remove library state after navigating to another page", () => {
    const testRecommendation = buildGame(
      303,
      "Cloud Harbor",
      ["Adventure", "Indie"],
      ["PC", "Switch"]
    );
    let savedInLibrary = false;

    // Keep auth and profile deterministic for this flow test.
    cy.intercept("GET", "**/api/v1/users/", {
      statusCode: 200,
      body: authenticatedUser,
    }).as("verifyUser");

    cy.intercept("GET", "**/api/v1/profile/", {
      statusCode: 200,
      body: cozyProfile,
    }).as("getProfile");

    cy.intercept({ method: "GET", pathname: "/api/v1/games/recommended/" }, {
      statusCode: 200,
      body: {
        strategy: "profile-driven",
        results: [testRecommendation],
      },
    }).as("getRecommendations");

    // App-level shared library lookup should reflect save mutations across page loads.
    cy.intercept("GET", "**/api/v1/games/saved/", () => {
      if (!savedInLibrary) {
        return {
          statusCode: 200,
          body: [],
        };
      }

      return {
        statusCode: 200,
        body: [
          {
            id: 1,
            game: {
              id: 9001,
              external_id: String(testRecommendation.id),
              title: testRecommendation.name,
              released_at: testRecommendation.released,
              image_url: testRecommendation.background_image,
              tags: testRecommendation.genres,
              metadata: {
                rawg_rating: testRecommendation.rating,
                platforms: testRecommendation.platforms,
              },
            },
          },
        ],
      };
    }).as("getSavedGames");

    // Save flow used by addToLibrary: create game record, verify not saved, then save.
    cy.intercept("POST", "**/api/v1/games/", (req) => {
      expect(req.body.external_id).to.eq(String(testRecommendation.id));
      req.reply({
        statusCode: 201,
        body: {
          id: 9001,
          external_id: String(testRecommendation.id),
        },
      });
    }).as("createGame");

    cy.intercept("GET", "**/api/v1/games/save/9001/", {
      statusCode: 200,
      body: { saved: false },
    }).as("checkSaved");

    cy.intercept("POST", "**/api/v1/games/save/9001/", (req) => {
      savedInLibrary = true;
      req.reply({
        statusCode: 201,
        body: { saved: true },
      });
    }).as("saveGame");

    // New releases page should include the same game id so the shared lookup can mark it saved.
    cy.intercept({ method: "GET", pathname: "/api/v1/games/rawg/" }, {
      statusCode: 200,
      body: {
        count: 1,
        next: null,
        previous: null,
        results: [testRecommendation],
      },
    }).as("getRawgGames");

    cy.visit("/recommended", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "test-token");
      },
    });

    cy.wait("@verifyUser");
    cy.wait("@getSavedGames");
    cy.wait("@getProfile");
    cy.wait("@getRecommendations");

    cy.contains("Cloud Harbor")
      .closest(".overflow-hidden")
      .within(() => {
        cy.contains("button", "Add to Library").click();
      });

    cy.wait("@createGame");
    cy.wait("@checkSaved");
    cy.wait("@saveGame");

    cy.contains("Cloud Harbor")
      .closest(".overflow-hidden")
      .within(() => {
        cy.contains("button", "Remove from Library").should("be.visible");
      });

    cy.visit("/new", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "test-token");
      },
    });

    cy.wait("@verifyUser");
    cy.wait("@getSavedGames");
    cy.wait("@getRawgGames");

    cy.contains("Cloud Harbor")
      .closest(".overflow-hidden")
      .within(() => {
        cy.contains("button", "Remove from Library").should("be.visible");
        cy.contains("button", "Add to Library").should("not.exist");
      });
  });

  it("shows different recommendations when profile inputs change", () => {
    const profileSequence = [cozyProfile, competitiveProfile];
    let profileCallCount = 0;
    const seenQueries = [];

    // Keep auth stable so we can focus this test on recommendation behavior.
    cy.intercept("GET", "**/api/v1/users/", {
      statusCode: 200,
      body: authenticatedUser,
    }).as("verifyUser");

    // Mock profile so we can switch profile data inside one test.
    cy.intercept("GET", "**/api/v1/profile/", (req) => {
      const profileIndex = Math.min(profileCallCount, profileSequence.length - 1);
      const profileBody = profileSequence[profileIndex];
      profileCallCount += 1;

      req.reply({
        statusCode: 200,
        body: profileBody,
      });
    }).as("getProfile");

    // Return different game results based on the profile query params.
    cy.intercept({ method: "GET", pathname: "/api/v1/games/recommended/" }, (req) => {
      const personalityTags = String(req.query.personality_tags || "");
      const playTimePreference = String(req.query.play_time_preference || "");
      const genreTags = String(req.query.genre_tags || "");
      const platformTags = String(req.query.platform_tags || "");
      const excludedTags = String(req.query.excluded_tags || "");

      seenQueries.push({ personalityTags, playTimePreference, genreTags, platformTags, excludedTags });

      if (
        personalityTags === "cozy,story-rich" &&
        playTimePreference === "short" &&
        genreTags === "adventure,indie" &&
        platformTags === "pc,switch" &&
        excludedTags === "horror"
      ) {
        req.reply({
          statusCode: 200,
          body: {
            strategy: "profile-driven",
            results: cozyRecommendations,
          },
        });
        return;
      }

      if (
        personalityTags === "competitive,fast-paced" &&
        playTimePreference === "long" &&
        genreTags === "shooter,action" &&
        platformTags === "pc,playstation-5" &&
        excludedTags === "casual"
      ) {
        req.reply({
          statusCode: 200,
          body: {
            strategy: "profile-driven",
            results: competitiveRecommendations,
          },
        });
        return;
      }

      req.reply({
        statusCode: 200,
        body: {
          strategy: "fallback",
          results: [],
        },
      });
    }).as("getRecommendations");

    // First load: cozy profile should produce cozy recommendation(s).
    cy.visit("/recommended", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "test-token");
      },
    });

    cy.wait("@verifyUser");
    cy.wait("@getProfile");
    cy.wait("@getRecommendations");
    cy.contains("Spiritfarer").should("be.visible");
    cy.contains("Apex Legends").should("not.exist");

    // Second load: profile intercept now returns the second profile variant.

    cy.visit("/recommended", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "test-token");
      },
    });

    cy.wait("@verifyUser");
    cy.wait("@getProfile");
    cy.wait("@getRecommendations");
    cy.contains("Apex Legends").should("be.visible");
    cy.contains("Spiritfarer").should("not.exist");

    // Final check: requests should be different between the two profiles.
    cy.then(() => {
      expect(seenQueries).to.have.length(2);
      expect(seenQueries[0]).to.not.deep.equal(seenQueries[1]);
      expect(seenQueries[0]).to.deep.equal({
        personalityTags: "cozy,story-rich",
        playTimePreference: "short",
        genreTags: "adventure,indie",
        platformTags: "pc,switch",
        excludedTags: "horror",
      });
      expect(seenQueries[1]).to.deep.equal({
        personalityTags: "competitive,fast-paced",
        playTimePreference: "long",
        genreTags: "shooter,action",
        platformTags: "pc,playstation-5",
        excludedTags: "casual",
      });
    });
  });
});
