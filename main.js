let bskyState = {};
const limit = 100;


const getPDS = async (did) => {
	let directoryURL = `https://plc.directory/${did}`;

	let response = await fetch(directoryURL);

	if (!response.ok) {
		addError(`Error when reaching out to the PLC Directory.`);
		return false;
	}

	return await response.json();
}


const getVerifications = async (did, pds, cursor = null) => {
	let pdsURL = `${pds}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.graph.verification&limit=${limit}`;

	if (cursor) {
		pdsURL += `&cursor=${cursor}`;
	}

	let response = await fetch(encodeURI(pdsURL));

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
			<td class="date">${item.value.createdAt}</td>
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


const addLoadButton = (cursor) => {
	let loadButton = document.createElement('div');
	loadButton.id = 'loadMore';
	loadButton.dataset.cursor = cursor;
	loadButton.innerHTML += 'Load More';
	document.querySelector('#content #loadMoreContainer').appendChild(loadButton);
}


const addListItems = async (verifications) => {
	let list = document.querySelector('#verificationsTable');

	list.innerHTML += await formatAccountDetails(verifications.records);

	// Add load more button if we've got 50
	if (verifications.records.length === limit) {
		addLoadButton(verifications.cursor);
	}
}


const checkAccount = () => {
	let accountText = document.querySelector('#accountInput').value;

	// Remove any '@'s and make lower case
	accountText = accountText.replace('@', '');
	accountText = accountText.toLowerCase();

	// Clear any messages we added previously
	document.querySelector('#content main').replaceChildren();

	// Clear the "Load More" button, if it's there
	if (document.querySelector('#loadMore')) {
		document.querySelector('#loadMore').remove();
	}

	// First, let's check if this account exists and is a verifier
	let getProfileURL = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${accountText}`;

	fetch(getProfileURL).then(async (response) => {
		if (!response.ok) {
			addError(`The Bluesky API responded with: ${response.status}. Please double-check the account name.`);
			return;
		}

		let data = await response.json();

		if (data.verification?.trustedVerifierStatus !== undefined) {
			let did = data.did;

			let verifiedBy = data.verification.verifications;

			// Now let's get the PDS that the account lives on
			let pds = await getPDS(did);

			// TODO: look into why `service` is an array, and what it would mean if there were more than one
			let pdsURL = pds.service[0].serviceEndpoint;

			// Let's ask the PDS what verification objects it has for the account
			let verifications = await getVerifications(did, pdsURL);

			// Save these details for later in case I need to load more
			bskyState = {
				'did': did,
				'pdsURL': pdsURL
			};

			// Table to contain things (shut up, I'm old and this is tabular data)
			let list = document.createElement('table');
			list.id = 'verificationsTable';
			list.classList.add('accountList');
			list.innerHTML += `<thead><tr><th class="name">Display Name</th><th class="handle">Handle</th><th class="date">Date Verified</th></tr></thead>`;
			document.querySelector('#content main').appendChild(list);

			// Write out what we found
			addListItems(verifications);
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


document.addEventListener('click', async (e) => {
	if (e.target.id === 'loadMore') {
		let cursor = e.target.attributes['data-cursor'].value;

		e.target.remove();

		let newVerifications = await getVerifications(bskyState.did, bskyState.pdsURL, cursor);

		addListItems(newVerifications);
	}
});
