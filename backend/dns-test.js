const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

dns.resolveSrv(
    "_mongodb._tcp.cluster0.ufwgqbf.mongodb.net",
    (error, addresses) => {
        if (error) {
            console.error("DNS ERROR:", error);
            return;
        }

        console.log("MongoDB SRV records:");
        console.log(addresses);
    }
);