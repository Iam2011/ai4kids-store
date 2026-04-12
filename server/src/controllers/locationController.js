export const lookupPincode = async (req, res) => {
  const { pincode } = req.params;

  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ message: "Enter a valid 6-digit pincode." });
  }

  const apiUrl = process.env.PINCODE_API_URL || "https://api.postalpincode.in/pincode";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  let response;

  try {
    response = await fetch(`${apiUrl}/${pincode}`, { signal: controller.signal });
  } catch (error) {
    return res.status(502).json({ message: "Failed to reach pincode service." });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return res.status(502).json({ message: "Failed to reach pincode service." });
  }

  const [record] = await response.json();
  const firstPostOffice = record?.PostOffice?.[0];

  if (!firstPostOffice) {
    return res.status(404).json({ message: "No location found for this pincode." });
  }

  res.json({
    pincode,
    city: firstPostOffice.District || firstPostOffice.Name,
    state: firstPostOffice.State,
    postOffice: firstPostOffice.Name,
    region: firstPostOffice.Region,
  });
};
