// const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
// const collectionParams: string | null = urlParams.get("collections");

// if (
//     collectionParams !== null &&
//     collectionParams.split(",").includes(collection)
// ) {
//     negotiateStore.update((value) => {
//         return [...value, site];
//     });
// }

// let sendableQuery!: SendableQuery;
// queryStore.subscribe((value: QueryItem[][]) => {
//     const uuid = uuidv4();
//     sendableQuery = {
//         query: value,
//         id: `${uuid}__search__${uuid}`,
//     };
// });

// : await sendRequestToProjectManager(
//       sendableQuery,
//       humanReadable,
//       collections,
//       queryBase64String,
//   );

/**
 * handle redirect to project manager url
 */
// if (negotiateOptions.negotiateApp === "project-manager") {
//     // project manager

//     if (!negotiatorResponse.redirect_uri) {
//         console.error("Negotiator response does not contain redirect uri");
//         return;
//     }

//     const indexOfQuestionMark: number = negotiatorResponse.redirect_uri
//         .toString()
//         .indexOf("?");

//     const subpage = "/project-view";
//     const negotiationURI =
//         negotiatorResponse.redirect_uri
//             .toString()
//             .slice(0, indexOfQuestionMark) +
//         `${subpage}` +
//         negotiatorResponse.redirect_uri
//             .toString()
//             .slice(indexOfQuestionMark);

//     window.location.href = negotiationURI;
// },

/**
 *
 * @param sendableQuery the query to be sent to the negotiator
 * @param humanReadable a human readable query string to view in the negotiator project
 * @param collections the collections to negotiate with
 * @param queryBase64String the query in base64 string format
 * @returns a promise containing the response from the project manager. The response contains the redirect uri
 */
// async function sendRequestToProjectManager(
//     sendableQuery: SendableQuery,
//     humanReadable: string,
//     collections: NegotiateOptionsSiteMapping[],
//     queryBase64String: string,
// ): Promise<NegotiatorResponse> {
//     /**
//      * get temporary token from oauth2
//      */
//     let temporaryToken: string | null = "";

//     try {
//         const res = await fetch(`/oauth2/auth`, {
//             method: "GET",
//             credentials: "include",
//         });

//         temporaryToken = res.headers.get("Authorization");
//     } catch (error) {
//         console.log("error", error);
//         return new Response() as Response & { redirect_uri: string };
//     }

//     /**
//      * build query params
//      */
//     const queryParam: string =
//         queryBase64String != "" ? `&query=${queryBase64String}` : "";

//     const negotiationPartners = collections
//         .map((collection) => collection.collection_id.toLocaleLowerCase())
//         .join(",");
//     const returnURL: string = `${window.location.protocol}//${window.location.host}/?collections=${negotiationPartners}${queryParam}`;
//     const urlParams: URLSearchParams = new URLSearchParams(
//         window.location.search,
//     );
//     const projectCode: string | null = urlParams.get("project-code");
//     const projectCodeParam: string = projectCode
//         ? `&project-code=${projectCode}`
//         : "";
//     const negotiateUrl = projectCode
//         ? negotiateOptions.editProjectUrl
//         : negotiateOptions.newProjectUrl;

//     let response!: NegotiatorResponse;

//     /**
//      * send request to project manager
//      */
//     try {
//         response = await fetch(
//             `${negotiateUrl}?explorer-ids=${negotiationPartners}&query-format=CQL_DATA&human-readable=${humanReadable}&explorer-url=${encodeURIComponent(returnURL)}${projectCodeParam}`,
//             {
//                 method: "POST",
//                 headers: {
//                     returnAccept: "application/json; charset=utf-8",
//                     "Content-Type": "application/json",
//                     Authorization: temporaryToken ? temporaryToken : "",
//                 },
//                 body: getCql(),
//             },
//         ).then((response) => response.json());

//         /**
//          * replace query-code with project-code
//          * TODO: remove when backend bug is fixed
//          */
//         if (response?.redirect_uri) {
//             response.redirect_uri = response.redirect_uri.replace(
//                 "query-code",
//                 "project-code",
//             );
//         }

//         return response;
//     } catch (error) {
//         console.log("error", error);
//         return new Response() as NegotiatorResponse;
//     }
// }

/**
 * @returns a base64 encoded CQL query
 */
// function getCql(): string {
//     const ast = buildAstFromQuery(currentQuery);

//     /**
//      * TODO:
//      * For now backenMeasures is hardcoded because
//      * this function only needed for dktk project manager so far.
//      * Change if needed for negotiator.
//      *
//      * should be configurable via options other than spot/blaze, so custom backends can be used
//      */
//     const cql = translateAstToCql(
//         ast,
//         false,
//         "DKTK_STRAT_DEF_IN_INITIAL_POPULATION",
//         currentMeasures[0].measures,
//     );

//     const library = buildLibrary(`${cql}`);
//     const measure = buildMeasure(
//         library.url,
//         currentMeasures[0].measures.map((measureItem) => measureItem.measure),
//     );
//     const query = { lang: "cql", lib: library, measure: measure };

//     return btoa(decodeURI(JSON.stringify(query)));
// }
