const LIGHTCAST_BASE_CONFIG = {
    apiKey: "n3pncM4UFnbKWMWVoFy65EOR9AkCZTd93WC2Q1x8",
    clientName: "UniversitySouthFloridaCMS",
    country: "us",
    locale: "en_US",
    themeCode: "0001",
    geoIds: ["-1"],
    level: "nation"
  };
  
  const LIGHTCAST_DEGREE_CONFIGS = {
    bscs: {
      key: "bscs",
      label: "BS Computer Science",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/undergraduate/bscs.aspx",
      pageTitle: "Bachelor of Science in Computer Science",
      widgetTitle: "Computer Science",
      modernCampusGroupCode: "0007",
      occupationCodes: [
        "15-1211.00",
        "15-1211.01",
        "15-1242.00",
        "15-1244.00",
        "15-1253.00",
        "15-1255.00",
        "15-1255.01",
        "15-1299.01",
        "15-1299.03",
        "15-1299.04",
        "15-1299.06",
        "15-1299.07"
      ]
    },
  
    bscp: {
      key: "bscp",
      label: "BS Computer Engineering",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/undergraduate/bscp.aspx",
      pageTitle: "Bachelor of Science in Computer Engineering",
      widgetTitle: "Computer Engineering",
      modernCampusGroupCode: "0006",
      occupationCodes: [
        "15-1231.00",
        "15-1232.00",
        "15-1241.01",
        "15-1252.00",
        "15-1253.00",
        "17-2061.00"
      ]
    },
  
    bscse: {
      key: "bscse",
      label: "BS Computer Science and Engineering",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/undergraduate/bscse.aspx",
      pageTitle: "Bachelor of Science in Computer Science and Engineering",
      widgetTitle: "Computer Science and Engineering",
      modernCampusGroupCode: "0010",
      occupationCodes: [
        "11-3021.00",
        "15-1211.00",
        "15-1221.00",
        "15-1241.00",
        "15-1242.00",
        "15-1243.00",
        "15-1244.00",
        "15-1253.00",
        "15-1255.00",
        "15-1299.04",
        "15-1299.06",
        "25-1021.00"
      ]
    },
  
    bsai: {
      key: "bsai",
      label: "BS Artificial Intelligence",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/undergraduate/bsai.aspx",
      pageTitle: "Bachelor of Science in Artificial Intelligence",
      widgetTitle: "Artificial Intelligence",
      modernCampusGroupCode: "0005",
      occupationCodes: [
        "15-1253.00",
        "15-1299.01",
        "15-1299.03",
        "15-2051.01",
        "15-2051.02"
      ]
    },
  
    bscys: {
      key: "bscys",
      label: "BS Cybersecurity",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/undergraduate/bscys.aspx",
      pageTitle: "Bachelor of Science in Cybersecurity",
      widgetTitle: "Cybersecurity",
      modernCampusGroupCode: "0008",
      occupationCodes: [
        "15-1212.00",
        "15-1231.00",
        "15-1242.00",
        "15-1244.00",
        "15-1299.04",
        "15-1299.06"
      ]
    },
  
    bsit: {
      key: "bsit",
      label: "BS Information Technology",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/undergraduate/bsit.aspx",
      pageTitle: "Bachelor of Science in Information Technology",
      widgetTitle: "Information Technology",
      modernCampusGroupCode: "0009",
      occupationCodes: [
        "15-1211.00",
        "15-1211.01",
        "15-1212.00",
        "15-1231.00",
        "15-1244.00",
        "15-1252.00",
        "15-1253.00",
        "15-1299.01"
      ]
    },
  
    mscs: {
      key: "mscs",
      label: "MS Computer Science",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/graduate/mscs.aspx",
      pageTitle: "Master of Science in Computer Science",
      widgetTitle: "Computer Science",
      modernCampusGroupCode: "0002",
      occupationCodes: [
        "15-1221.00",
        "15-1241.00",
        "15-1242.00",
        "15-1243.00",
        "15-1252.00",
        "15-1253.00",
        "15-1299.08",
        "15-1299.09",
        "15-2051.00"
      ]
    },
  
    mscpe: {
      key: "mscpe",
      label: "MS Computer Engineering",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/graduate/mscpe.aspx",
      pageTitle: "Master of Science in Computer Engineering",
      widgetTitle: "Computer Engineering",
      modernCampusGroupCode: "0003",
      occupationCodes: [
        "15-1221.00",
        "15-1241.00",
        "15-1243.00",
        "15-1251.00",
        "15-1252.00",
        "15-1253.00",
        "15-1299.08",
        "17-2061.00"
      ]
    },
  
    msai: {
      key: "msai",
      label: "MS Artificial Intelligence",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/graduate/msai.aspx",
      pageTitle: "Master of Science in Artificial Intelligence",
      widgetTitle: "Artificial Intelligence",
      modernCampusGroupCode: "0004",
      occupationCodes: [
        "15-1221.00",
        "15-1241.00",
        "15-1243.00",
        "15-1252.00",
        "15-1299.08",
        "15-2031.00",
        "15-2041.00",
        "15-2051.00"
      ]
    },
  
    mscys: {
      key: "mscys",
      label: "MS Cybersecurity",
      pageUrl: "https://www.usf.edu/ai-cybersecurity-computing/academics/graduate/mscys.aspx",
      pageTitle: "Master of Science in Cybersecurity",
      widgetTitle: "Cybersecurity",
      modernCampusGroupCode: "0001",
      occupationCodes: [
        "11-3021.00",
        "13-1199.07",
        "15-1212.00",
        "15-1241.00",
        "15-1299.04",
        "15-1299.05",
        "15-1299.08"
      ]
    },
  
    phdCse: {
      key: "phdCse",
      label: "PhD Computer Science and Engineering",
      pageUrl: "https://usf.to/PhD-Computer-Science-and-Engineering",
      pageTitle: null,
      widgetTitle: null,
      modernCampusGroupCode: null,
      occupationCodes: [],
      needsManualResolution: true,
      note: "Shortlink failed during probe. Replace with final www.usf.edu URL and rerun."
    },
  
    phdBda: {
      key: "phdBda",
      label: "PhD Big Data Analytics",
      pageUrl: "https://usf.to/PhD-Big-Data-Analytics",
      pageTitle: null,
      widgetTitle: null,
      modernCampusGroupCode: null,
      occupationCodes: [],
      needsManualResolution: true,
      note: "Shortlink failed during probe. Replace with final www.usf.edu URL and rerun."
    }
  };

  function buildLightcastWidgetDataUrl(degreeKey) {
    const degreeConfig = LIGHTCAST_DEGREE_CONFIGS[degreeKey];
  
    if (!degreeConfig) {
      throw new Error("Unknown degree key: " + degreeKey);
    }
  
    if (!Array.isArray(degreeConfig.occupationCodes) || degreeConfig.occupationCodes.length === 0) {
      throw new Error("No occupation codes configured for degree key: " + degreeKey);
    }
  
    const params = new URLSearchParams();
  
    params.set("occupationCodes", degreeConfig.occupationCodes.join(","));
    params.set("geoIds", LIGHTCAST_BASE_CONFIG.geoIds.join(","));
    params.set("level", LIGHTCAST_BASE_CONFIG.level);
    params.set("cacheTimestamp", Date.now().toString());
  
    return (
      "https://api.pathways.moderncampus.net/v1/tenant-public/clients/" +
      encodeURIComponent(LIGHTCAST_BASE_CONFIG.clientName) +
      "/" +
      encodeURIComponent(LIGHTCAST_BASE_CONFIG.country) +
      "/widget-data?" +
      params.toString()
    );
  }

  async function fetchLightcastDataForDegree(degreeKey) {
    const requestUrl = buildLightcastWidgetDataUrl(degreeKey);
  
    const response = await fetch(requestUrl, {
      method: "GET",
      mode: "cors",
      cache: "default",
      credentials: "omit",
      headers: {
        "Accept": "application/json",
        "x-api-key": LIGHTCAST_BASE_CONFIG.apiKey
      }
    });
  
    if (!response.ok) {
      const bodyText = await response.text();
  
      throw new Error(
        "Modern Campus API returned " +
        response.status +
        " for " +
        degreeKey +
        ". Body: " +
        bodyText.slice(0, 500)
      );
    }
  
    const payload = await response.json();
  
    if (!payload || !payload.data || !Array.isArray(payload.data.careers)) {
      throw new Error("Unexpected Lightcast payload shape for " + degreeKey);
    }
  
    return {
      degreeKey: degreeKey,
      degreeConfig: LIGHTCAST_DEGREE_CONFIGS[degreeKey],
      requestUrl: requestUrl,
      payload: payload
    };
  }