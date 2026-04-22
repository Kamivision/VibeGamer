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
