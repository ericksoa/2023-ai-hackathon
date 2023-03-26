import axios from "axios";
import csvToJson from "csvtojson";

export async function getLatestCovidData(): Promise<any> {
  // Base URL for COVID-19 data
  const baseURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-09-2023.csv";
  try {
    // Download the CSV data
    const response = await axios.get(baseURL);
    // Convert the CSV data to JSON
    const json = await csvToJson().fromString(response.data)
    return json
  } catch (error) {
    console.error("Failed to download data:", error);
    return null;
  }
}
