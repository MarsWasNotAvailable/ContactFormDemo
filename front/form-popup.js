'use strict';

//const e = React.createElement; //when not using JSX

class Notififier extends React.Component {
	InputRef = React.createRef(null);
	
	constructor(props) {
		super(props);
		this.state = {
			pop		:	props.enable,
			message	:	props.message,
			timeout :	props.timeout
		};
		
		setTimeout(function(){
			this.setState({ pop: false });

			this.props.onDone();

		}.bind(this), this.props.timeout);
	};
	
	componentDidMount(){
		//console.log("InputRef: ", this.InputRef.current);
	}
	
	render() {
		let VisibilityClassName = this.state.pop ? "show" : "";
		
		let NotifierBase = (
			<div ref={this.InputRef} id="notification" className={VisibilityClassName}>{ this.state.message }</div>
		);
		
		return NotifierBase;
	};
}

class RegisterForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { pop: false };
	};
	
	OnNotificationDone(NotificationRoot, NotificationPopUp)
	{
		//destroying the notifications.
		
		NotificationRoot.unmount();
		document.body.removeChild(NotificationPopUp);
	}

	OnFormSubmit(Event){
		//console.log("Event.target.checkValidity(): ", Event.target.checkValidity());
		
		if (!Event.target.checkValidity())
		{
			//I prefer the form validation done by HTML5:
			//it's a bit weird sometimes, but that would be their problem
			//mail address for example can not have TLD into domain name, that is: some@example is a valid mail
			//if that become a problem, the email input field could use that pattern: "*@*.*"
			return false;
		}
		
		this.setState({ pop: false });

		Event.preventDefault();

		let TheRegisterForm = Event.target;

		let QueryString = new URLSearchParams(new FormData(TheRegisterForm)).toString();
		
		const TargetURL = TheRegisterForm.action || new URL( location.origin + "/update" );

		//The server currently support JSON, URLQueryString and MultiPartFormData (allows for file attachements)
		let Options = {
			method: 'POST',
			headers: { 'Content-Type': 'multipart/form-data' },
			body: new FormData(TheRegisterForm)
			//headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			//body: QueryString
		};

		fetch(TargetURL, Options)
		.then((Response) => Response.json())
		.then( (JSON) => {
			//console.log(JSON);
			
			let NotificationMessage = "Successfully registered " + JSON.Mail.toString();
			
			let NotificationPopUp = document.createElement("div");
			const NotificationRoot = ReactDOM.createRoot(NotificationPopUp);
			const NotifierComponent = <Notififier enable={true} message={NotificationMessage} timeout={2105} onDone={ ()=>{ this.OnNotificationDone(NotificationRoot, NotificationPopUp); } }/>;
			NotificationRoot.render(NotifierComponent);
			document.body.appendChild(NotificationPopUp);
			
		} )
		.catch((e) => console.error(e));
	};

	render() {
		if (this.state.pop) {

			let FormBase = (
					
					<form id="RegisterForm" onSubmit={(event)=>{this.OnFormSubmit(event)}} action="index.html" method="post">
						<input name="NameFirst" placeholder="Entrer votre prénom" type="text" required/>
						<input name="NameLast" placeholder="Entrer votre nom de famille" type="text" required/>
						<input name="Mail" placeholder="Entrer votre email" type="email" required/>
						<input name="Postcode" placeholder="Entrer votre code postale" type="text" pattern="\d{5}" required/>
						<label htmlFor="Attachments">Pièces jointes</label>
						<input name="Attachments" type="file" multiple/>
						
						<textarea name="Message" placeholder="Entrer votre message ici" required/>

						<input name="Intent" value="Register" type="hidden" />
						
						<div>
							<button className="mdl-button mdl-js-button mdl-button--raised">
							Valider
							</button>
						</div>
					</form>
				);
			
			return FormBase;
		}

		// return e(
		  // 'button',
		  // { id: "FormPopUpButton", onClick: () => this.setState({ pop: true }) },
		  // 'Nous contacter'
		// );
		return (
				<button id={"FormPopUpButton"} onClick={() => this.setState({ pop: true })}>Nous contacter</button>
			);
	};
}

const domContainer = document.querySelector('#Register_Form_Container');
const root = ReactDOM.createRoot(domContainer);
//root.render(e(RegisterForm));
root.render(<RegisterForm/>);
