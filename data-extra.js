/* Extra (manual) data additions on top of extracted data.js */
(function () {
  if (!window.UGEAC_DATA) return;
  const D = window.UGEAC_DATA;

  const KEY = "GOVT. ENGG. COLLEGE, VAISHALI";
  if (D.INFO && !D.INFO[KEY]) {
    D.INFO[KEY] = {
      fullName: "Government Engineering College, Vaishali",
      estd: null,
      type: "Government",
      affiliation: "Bihar Engineering University, Patna",
      address: "Vaishali, Bihar",
      city: "Vaishali",
      district: "Vaishali",
      lat: null,
      lng: null,
      website: null,
      email: null,
      phone: null,
      about:
        "Government Engineering College, Vaishali is a government engineering institute in Bihar. (Details like branches, cutoffs and contact can be added once available.)",
      naac: null,
      hostel: null,
      fees: null,
      transport: null,
      image: null,
      gallery: [],
    };
  }

  if (Array.isArray(D.META) && !D.META.some((m) => m.name === KEY)) {
    D.META.push({
      name: KEY,
      rank: 9,
      avg_air: null,
      branches: [
        "CIVIL ENGINEERING",
        "COMPUTER SC. & ENGINEERING",
        "ELECTRICAL & ELECTRONICS ENGINEERING",
        "ELECTRO  & COMMUNICATION ENGINEERING",
        "MECHANICAL ENGINEERING",
      ],
    });
  }
})();

