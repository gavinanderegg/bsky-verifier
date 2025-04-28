const checkAccount = () => {
	let accountText = document.querySelector('#accountInput').value;

	// Remove any '@'s
	accountText = accountText.replace('@', '');

	// Clear any messages we added previously
	document.querySelector('#content main').replaceChildren();

	// First, let's check if this account exists and is a verifier
	let getProfileURL = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${accountText}`;
	fetch(getProfileURL).then((response) => {
		if (!response.ok) {
			addError(`The Bluesky API responded with: ${response.status}. Please double-check the account name.`);
			return;
		}

	// {"did":"did:plc:inz4fkbbp7ms3ixufw6xuvdi","handle":"wired.com","displayName":"WIRED ","avatar":"https://cdn.bsky.app/img/avatar/plain/did:plc:inz4fkbbp7ms3ixufw6xuvdi/bafkreifrsmtmuymsd7trfqapt6rj32cjmq4yqahgrgmfck3rh2xbgfeh64@jpeg","associated":{"lists":0,"feedgens":2,"starterPacks":0,"labeler":false},"labels":[],"createdAt":"2024-02-20T14:59:23.304Z","verification":{"verifications":[{"issuer":"did:plc:z72i7hdynmk6r22z27h6tvur","uri":"at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.graph.verification/3lndpvghzm32x","isValid":true,"createdAt":"2025-04-21T10:47:38.316Z"}],"verifiedStatus":"valid","trustedVerifierStatus":"valid"},"description":"At wired.com where tomorrow is realized || Sign up for our newsletters: https://wrd.cm/newsletters\n\nFind our WIRED journalists here: https://bsky.app/starter-pack/couts.bsky.social/3l6vez3xaus27\n\n","indexedAt":"2025-04-28T11:24:08.874Z","banner":"https://cdn.bsky.app/img/banner/plain/did:plc:inz4fkbbp7ms3ixufw6xuvdi/bafkreia7kfzp37yv5k6rmhjyzcwy57ubt4jyb4umkzluqdua6gcflaic7q@jpeg","followersCount":319216,"followsCount":78,"postsCount":2323,"pinnedPost":{"cid":"bafyreih432xzklu5wdzawans2uiw5kghrcickes4odyyi3amzqk4ka2l64","uri":"at://did:plc:inz4fkbbp7ms3ixufw6xuvdi/app.bsky.feed.post/3lnuj6s76zv24"}}




	});

	// Now let's get the PDS that the account lives on
	// Let's ask the PDS what verification objects it has for the account

	// Write out what we found

};

const addError = (errorText) => {
	let errorMessage = document.createElement('div');
	errorMessage.classList.add('error');
	errorMessage.textContent = errorText;
	document.querySelector('#content main').appendChild(errorMessage);
}

document.querySelector('#accountInput').addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		// checkAccount();


	}
});

document.querySelector('#goButton').addEventListener('click', (e) => {
	// checkAccount();

	addError('testing!');
});
