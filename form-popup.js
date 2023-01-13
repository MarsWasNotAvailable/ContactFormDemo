'use strict';

const e = React.createElement;

class FormPopUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = { pop: false };
	}

	OnFormSubmit(){
		this.setState({ pop: false });
		console.log(pop);
	}

	render() {
		if (this.state.pop) {
			return (
					<form id="RegisterForm" submit="OnFormSubmit" action="index.html" method="post">
						<input name="NameFirst" placeholder="Entrer votre prénom" type="text" required/>
						<input name="NameLast" placeholder="Entrer votre nom de famille" type="text" required/>
						<input name="Mail" placeholder="Entrer votre email" type="email" required/>
						<input name="Postcode" placeholder="Entrer votre code postale" type="text" pattern="\d*" required/>

						<input name="Intent" value="Register" type="hidden" />
						
						<div class="bouton">
							<button class="mdl-button mdl-js-button mdl-button--raised"
							>
							Valider
							</button>
						</div>
					</form>
				);
		}

		return e(
		  'button',
		  { onClick: () => this.setState({ pop: true }) },
		  'Nous contacter'
		);
	}
}

const domContainer = document.querySelector('#form_pop');
const root = ReactDOM.createRoot(domContainer);
root.render(e(FormPopUp));
