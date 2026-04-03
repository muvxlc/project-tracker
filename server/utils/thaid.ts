// Mock ThaiID (DOPA) OIDC Utility
export const getThaIDAuthUrl = () => {
  const baseUrl = process.env.THAID_BASE_URL || 'https://imauth.bora.dopa.go.th/api/v2/oauth2/auth';
  const clientId = process.env.THAID_CLIENT_ID || 'mock_client_id';
  const redirectUri = process.env.THAID_REDIRECT_URI || 'http://localhost:3001/api/auth/thaid/callback';
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile pid',
    state: 'mock_state'
  });

  return `${baseUrl}?${params.toString()}`;
};

export const getThaIDUser = async (code: string) => {
  // Mock exchange code for user info
  return {
    pid: '1234567890123',
    given_name: 'สมชาย',
    family_name: 'สายลม',
    name: 'สมชาย สายลม'
  };
};
