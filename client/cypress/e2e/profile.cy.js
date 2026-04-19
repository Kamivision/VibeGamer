/* global beforeEach, cy, describe, it */

const authenticatedUser = {
	email: "pixel@example.com",
	username: "pixelplayer",
};

const initialProfile = {
	personality: "Cozy Explorer",
	play_time_preference: "short",
	personality_tags: ["cozy", "story-rich"],
	genre_tags: ["Adventure"],
	platform_tags: ["PC"],
	excluded_tags: ["horror"],
	quiz_results: { score: 4 },
};

const profileOptions = {
	genre_tags: ["Adventure", "RPG", "Puzzle"],
	platform_tags: ["PC", "Switch", "PlayStation 5"],
};

function visitAuthenticatedProfile() {
	cy.intercept("GET", "**/api/v1/users/", {
		statusCode: 200,
		body: authenticatedUser,
	}).as("verifyUser");

	cy.intercept("GET", "**/api/v1/profile/", {
		statusCode: 200,
		body: initialProfile,
	}).as("getProfile");

	cy.intercept("GET", "**/api/v1/profile/options/", {
		statusCode: 200,
		body: profileOptions,
	}).as("getProfileOptions");

	cy.visit("/profile", {
		onBeforeLoad(win) {
			win.localStorage.setItem("token", "test-token");
		},
	});

	cy.wait("@verifyUser");
	cy.wait("@getProfile");
	cy.wait("@getProfileOptions");
}

describe("UserProfile page", () => {
	beforeEach(() => {
		cy.clearLocalStorage();
	});

	it("redirects guests to the auth page", () => {
		cy.visit("/profile");

		cy.url().should("include", "/auth");
		cy.contains("h2", "Sign In").should("be.visible");
	});

	it("loads, edits, and saves the user profile", () => {
		const updatedProfile = {
			personality: "Arcade Optimist",
			play_time_preference: "medium",
			personality_tags: ["co-op", "bright", "arcade"],
			genre_tags: ["Adventure", "RPG"],
			platform_tags: ["PC", "Switch"],
			excluded_tags: ["grindy", "zombies"],
			quiz_results: { score: 4 },
		};

		cy.intercept("PUT", "**/api/v1/profile/", (req) => {
			expect(req.body).to.deep.equal(updatedProfile);
			req.reply({
				statusCode: 200,
				body: updatedProfile,
			});
		}).as("updateProfile");

		visitAuthenticatedProfile();

		cy.contains("pixelplayer's Profile").should("be.visible");
		cy.contains("Personality: Cozy Explorer").should("be.visible");
		cy.contains("Tags: cozy, story-rich").should("be.visible");
		cy.contains("Play Time: short").should("be.visible");
		cy.contains("Genres: Adventure").should("be.visible");
		cy.contains("Platforms: PC").should("be.visible");
		cy.contains("Excluded Tags: horror").should("be.visible");

		cy.contains("button", "Edit Profile").click();

		cy.get("#personality").clear().type(updatedProfile.personality);
		cy.get("#tags").clear().type(updatedProfile.personality_tags.join(", "));
		cy.get("#play-time").select(updatedProfile.play_time_preference);
		cy.contains("label", "RPG").click();
		cy.contains("label", "Switch").click();
		cy.get("#excluded-tags").clear().type(updatedProfile.excluded_tags.join(", "));

		cy.contains("button", "Save Changes").click();

		cy.wait("@updateProfile");
		cy.contains("button", "Edit Profile").should("be.visible");
		cy.contains("Personality: Arcade Optimist").should("be.visible");
		cy.contains("Tags: co-op, bright, arcade").should("be.visible");
		cy.contains("Play Time: medium").should("be.visible");
		cy.contains("Genres: Adventure, RPG").should("be.visible");
		cy.contains("Platforms: PC, Switch").should("be.visible");
		cy.contains("Excluded Tags: grindy, zombies").should("be.visible");
	});
});
