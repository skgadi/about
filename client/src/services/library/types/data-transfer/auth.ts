import type { GSK_USER_SELF_DETAILS } from '../structures/users.js';

export interface GSK_CS_AUTH_SIGN_IN {
  id: 'GSK_CS_AUTH_SIGN_IN';
  payload: {
    email: string;
    password: string;
  };
}

export interface GSK_CS_AUTH_SIGN_OUT {
  id: 'GSK_CS_AUTH_SIGN_OUT';
  payload: object;
}

export interface GSK_SC_AUTH_SIGN_IN_SUCCESS {
  id: 'GSK_SC_AUTH_SIGN_IN_SUCCESS';
  payload: {
    user: GSK_USER_SELF_DETAILS;
  };
}

export interface GSK_SC_AUTH_SIGN_OUT_SUCCESS {
  id: 'GSK_SC_AUTH_SIGN_OUT_SUCCESS';
  payload: object;
}
