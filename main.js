let bskyState = {};


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


const formatAccountDetails = (verificationsList) => {
	let accountsString = '';

	verificationsList.forEach((item) => {
		accountsString += `
		<tr class="account">
			<td class="name">${item.value.displayName}</td>
			<td class="handle"><a href="https://bsky.app/profile/${item.value.handle}" target="_blank">${item.value.handle}</a></td>
		</tr>
		`;
	});

	return accountsString;
}


const addError = (errorText) => {
	let errorMessage = document.createElement('div');
	errorMessage.classList.add('error');
	errorMessage.textContent = errorText;
	document.querySelector('#content main').appendChild(errorMessage);
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

			// TODO: Maybe list who verified this account and when
			const verifiedBy = data.verification.verifications;

			// Now let's get the PDS that the account lives on
			const pds = await getPDS(did);

			// TODO: look into why `service` is an array, and what it would mean if there were more than one
			const pdsURL = pds.service[0].serviceEndpoint;

			// Let's ask the PDS what verification objects it has for the account
			const verifications = await getVerifications(did, pdsURL);
			const verificationsCursor = verifications.cursor;

			// Write out what we found
			let list = document.createElement('table');
			list.classList.add('accountList');
			list.innerHTML += `<thead><tr><th>Display Name</th><th>Handle</th></tr></thead>`;
			list.innerHTML += await formatAccountDetails(verifications.records);
			document.querySelector('#content main').appendChild(list);

		} else {
			addError(`The account ${accountText} exists, but isn't a verifier.`);
		}
	}).catch((error) => {
		addError(`Caught rejection: ${error}`);
	});
}


document.querySelector('#accountInput').addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		checkAccount();
	}
});


document.querySelector('#goButton').addEventListener('click', (e) => {
	checkAccount();
});
