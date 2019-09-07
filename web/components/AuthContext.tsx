import * as React from 'react';

import IAuth from './interfaces/IAuth';

const AuthContext = React.createContext<IAuth>({
	user: null
});

export default AuthContext;