const getPDS = async (did) => {
	const directoryURL = `https://plc.directory/${did}`;

	const response = await fetch(directoryURL);

	if (!response.ok) {
		addError(`Error when reaching out to the PLC Directory.`);
		return false;
	}

	return await response.json();
}


const getVerifications = async (did, pds) => {
	// TODO: loop over this using the cursor:
	// https://docs.bsky.app/docs/tutorials/viewing-feeds#viewing-a-users-timeline
	const pdsURL = `${pds}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.graph.verification&limit=50`;

	const response = await fetch(encodeURI(pdsURL));

	if (!response.ok) {
		addError(`Error querying the PDS.`);
		return false;
	}

	return await response.json();
}


const checkAccount = () => {
	let accountText = document.querySelector('#accountInput').value;

	// Remove any '@'s
	accountText = accountText.replace('@', '');

	// Clear any messages we added previously
	document.querySelector('#content main').replaceChildren();

	// First, let's check if this account exists and is a verifier
	const getProfileURL = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${accountText}`;

	fetch(getProfileURL).then(async (response) => {
		if (!response.ok) {
			addError(`The Bluesky API responded with: ${response.status}. Please double-check the account name.`);
			return;
		}

		const data = await response.json();

		if (data.verification?.trustedVerifierStatus !== undefined) {
			const did = data.did;
			const verifiedBy = data.verification.verifications;

			// Now let's get the PDS that the account lives on
			const pds = await getPDS(did);

			// TODO: look into why `service` is an array, and what it would mean if there were more than one
			const pdsURL = pds.service[0].serviceEndpoint;

			// Let's ask the PDS what verification objects it has for the account
			const verifications = await getVerifications(did, pdsURL);

			// Write out what we found
			console.log(verifications.records);

		} else {
			addError(`The account ${accountText} exists, but isn't a verifier.`);
		}
	});
}


const addError = (errorText) => {
	let errorMessage = document.createElement('div');
	errorMessage.classList.add('error');
	errorMessage.textContent = errorText;
	document.querySelector('#content main').appendChild(errorMessage);
}


document.querySelector('#accountInput').addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		checkAccount();
	}
});


document.querySelector('#goButton').addEventListener('click', (e) => {
	checkAccount();
});
