import React, { Component } from 'react'

import './Auth.css'
import AuthContext from '../context/auth-context'

class AuthPage extends Component {
    state = {
        isLogin: true
    }

    static contextType = AuthContext

    constructor(props) {
        super(props);
        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    }

    switchModeHandler = () => {
        this.setState(pervState => {
            return {isLogin: !pervState.isLogin};
        });
    }
    
    submitHandler = (events) => {
        events.preventDefault();
        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;

        if(email.trim().length === 0 || password.trim().length === 0) {
            return;
        }

        let requestBody = {
            query: `
                query {
                    login(email: "${email}", password: "${password}") {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `
        };

        if(!this.state.isLogin) {
            requestBody = {
                query: `
                    mutation {
                        createUser(userInput: {email: "${email}", password: "${password}"}) {
                            _id
                            email
                        }
                    }
                `
            };
        }


        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if(response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                return response.json();
            })
            .then(responseData => {
                if(responseData.data.login.token) {
                    this.context.login(
                        responseData.data.login.token, 
                        responseData.data.login.userId, 
                        responseData.data.login.tokenExpiration
                    );
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    render() {
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
                <div className="form-control">
                    <label htmlFor="email">E-Mail</label>
                    <input type="email" id="email" ref={this.emailEl} />
                </div>
                <div className="form-control">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" ref={this.passwordEl} />
                </div>
                <div className="form-actions">
                    <button type="submit">Submit</button>
                    <button type="button" onClick={this.switchModeHandler}>Switch to {this.state.isLogin ? 'Signup' : 'Login'}</button>
                </div>
            </form>
        )
    }
}

export default AuthPage
