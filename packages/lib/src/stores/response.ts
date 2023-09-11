import { writable } from "svelte/store";


export const responseStore = writable([
    { site: "heidelberg", patients: 234, samples: 1234 },
    { site: "dresden", patients: 234, samples: 1234 },
    { site: "berlin", patients: 234, samples: 1234 },
    { site: "frankfurt", patients: 234, samples: 1234 },
    { site: "leibzig", patients: 234, samples: 1234 },
]);