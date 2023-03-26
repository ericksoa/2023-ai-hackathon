import axios from 'axios';

interface Contribution {
  candidate: string;
  contributor: string;
  amount: number;
}

const getCandidatesByState = async (apiKey: string, cycle: string, state: string): Promise<string[] | null> => {
  try {
    const response = await axios.get('https://www.opensecrets.org/api/', {
      params: {
        method: 'getLegislators',
        apikey: apiKey,
        id: state,
        output: 'json',
      },
    });

    if (response.data && response.data.response && response.data.response.legislator) {
      const candidateIds: string[] = response.data.response.legislator.map((legislator: any) => legislator['@attributes'].cid);
      return candidateIds;
    }
  } catch (error) {
    console.error('Error fetching candidates:', error);
  }

  return null;
};

const getContributions = async (apiKey: string, cycle: string, cid: string): Promise<Contribution[] | null> => {
  try {
    const response = await axios.get('https://www.opensecrets.org/api/', {
      params: {
        method: 'candContrib',
        apikey: apiKey,
        cid: cid,
        cycle: cycle,
        output: 'json',
      },
    });

    if (response.data && response.data.response && response.data.response.contributors) {
      const candidateName = response.data.response.contributors['@attributes'].cand_name;
      const contributions: Contribution[] = response.data.response.contributors.contributor.map((contributor: any) => {
        return {
          candidate: candidateName,
          contributor: contributor['@attributes'].org_name,
          amount: parseFloat(contributor['@attributes'].total),
        };
      });

      return contributions;
    }
  } catch (error) {
    console.error('Error fetching contributions:', error);
  }

  return null;
};

export const getContributorData = async (apiKey:string, cycle:string, state:string) => {

  const candidateIds = await getCandidatesByState(apiKey, cycle, state);
  if (!candidateIds) return[]
  if (candidateIds) {
    const contributionsPromises = candidateIds.map((candidateId) => getContributions(apiKey, cycle, candidateId));
    const contributionsByCandidate = await Promise.all(contributionsPromises);
    const allContributions: (Contribution|null)[] = contributionsByCandidate.flat().filter(Boolean);
    return allContributions
  } else {
    return[];
  }
};