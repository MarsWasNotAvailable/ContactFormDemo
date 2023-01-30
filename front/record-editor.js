'use strict';

function ContactRow(props) {
	
	let [PostcodeDisplay, SetPostcodeDisplay] = React.useState(props.postcode);

	function SetPostcode(event, OldValue, NewValue){
		
		//basically props.postcode !== PostcodeDisplay
		//this function always notifies to parent with onUpdate
		//to update the component, therefore props.postcode should be the last value
		//while PostcodeDisplay caches the new input until this function is called
		//so, in short: if we have a change of Postcode
		if (OldValue !== NewValue)
		{
			if (event.target.checkValidity())
			{
				SetPostcodeDisplay(NewValue);
				
				try
				{
					const url = new URL( location.origin + "/update" );
					
					var UpdateData = {
						Mail		:	props.mail,
						Postcode	:	NewValue,
						Intent		:	"Update"
					};

					let Options = {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: (JSON.stringify(UpdateData))
					};
					
					//delete UpdateData.Intent;
                    
					//will send a query to database to update the record
					fetch( url, Options )
					.then((Response) => Response.json())
					.then( (JSON) => { 
							console.log("Server response after update: ", JSON);
							//props.onUpdate(UpdateData);
							props.onUpdate({ Mail: props.mail, NameFirst: props.first, NameLast : props.last, Postcode: NewValue});
						} )
					;
				}
				catch (err)
				{
					console.error('Caught error: ', err);
				}
			}
			else
			{
				SetPostcodeDisplay(OldValue);
			}
		}
	}

	return (
		<tr id={ props.mail }>
			<td name="UserMail">{ props.mail }</td>
			<td>{ props.first }</td>
			<td>{ props.last }</td>
			<td>{ props.date }</td>
			<td>
				<input form="PostingForm" type="text" name="Postcode"
					onBlur={(event)=>{ SetPostcode(event, props.postcode, PostcodeDisplay ); }}
					onChange={(event)=>{
						SetPostcodeDisplay(event.target.value);
					}}
					value={ PostcodeDisplay }
					pattern="\d{5}" className="no-outline" tabIndex="0" required/>
			</td>
			<td>{ props.ip }</td>
		</tr>
	);
};

class RecordEditorTable extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			SortState : "None",
			HaveRecord : false,
			Records : [{
				Postcode : "00000",
				Mail : "admin@localhost",
				NameFirst : "admin",
				NameLast : "admin",
				DateAdded : "20230101",
				IP : "localhost"
			}]
		};
		
		this.PopulateTable = this.PopulateTable.bind(this);
		this.RefreshRecords = this.RefreshRecords.bind(this);
	};
	
	componentDidMount(){
		const url = new URL( location.origin + "/retrieve" );
		
		//Heard this is not standard (the charset part): 'application/json;charset=utf-8'
		let Options = {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		};

		fetch( url, Options )
		.then((Response) => Response.json())
		.then( (JSON) => {
			this.setState({ Records: JSON, HaveRecord : true });
			this.PopulateTable(JSON, "DateAdded");
		});
	}
	
	SortRecords(SortParameter){
		this.PopulateTable(this.state.Records, SortParameter);
	}

	PopulateTable(JsonData, SortParameter){
		JsonData.sort((Left, Right)=>{
			//Factor was meant to hold on for complex sorting:
			//but it suits me fine as simple as it is
			let Factor = 0;
			
			switch(SortParameter)
			{
				case 'IP':
					Factor += Number(Left.IP > Right.IP);
					break;
				case 'Mail':
					Factor += Number(Left.Mail > Right.Mail);
					break;
				case 'NameFirst':
					Factor += Number(Left.NameFirst > Right.NameFirst);
					break;
				case 'NameLast':
					Factor += Number(Left.NameLast > Right.NameLast);
					break;
				case 'Postcode':
					Factor += Number(Left.Postcode > Right.Postcode);
					break;
				case 'DateAdded':
				default:
					Factor += Number(Left.DateAdded > Right.DateAdded);
					break;
			}
			
			return Factor; //returning -1,0,1 means respectively inferior,equal,superior
		});
		
		if (this.state.SortState === SortParameter)
		{
			JsonData.reverse();
			
			SortParameter = "Reversed" + SortParameter;	//will be passed to SortState below
		}
			
		this.setState({ Records: JsonData, SortState: SortParameter });
	}
	
	//Since we're reacting to onBlur event, the final assignment on this.state.Records (all of them) is a bit much
	//But provided a button to the End-User to commit changes,
	//a single function like that could prove more efficient at updating the whole record.
	//But here is good enough for a demo
	RefreshRecords(NewRecord){
		let UpdatingRecord = this.state.Records;
		
		UpdatingRecord.find( (Each, Index)=>{
			//If the database stores only uniques based on mail address (which it should), we only need to check Mail
			//But in case that changes (which it shouldnt), that piece of code shouldnt break.
			if (Each.Mail === NewRecord.Mail && Each.NameFirst === NewRecord.NameFirst && Each.NameLast === NewRecord.NameLast)
			{
				UpdatingRecord[Index].Postcode = NewRecord.Postcode;
				return true;
			}
			return false;
		});
		
		this.setState({ Records: UpdatingRecord });
	}
	
	render(){
		let Rows = [];
		
		this.state.Records.forEach((EachRecord) => {
			Rows.push(
				<ContactRow key={EachRecord.Mail}
							postcode={EachRecord.Postcode}
							mail={EachRecord.Mail}
							first={EachRecord.NameFirst}
							last={EachRecord.NameLast}
							date={EachRecord.DateAdded}
							ip={EachRecord.IP}
							onUpdate={ this.RefreshRecords }
					/>
			);
		});
		
		let Header = (
			<thead>
				<tr>
					<th className="clickable" onClick={ (event)=>{ this.SortRecords('Mail') } }		>Mail</th>
					<th className="clickable" onClick={ (event)=>{ this.SortRecords('NameFirst') } }>Prénom</th>
					<th className="clickable" onClick={ (event)=>{ this.SortRecords('NameLast') } }	>Nom De Famille</th>
					<th className="clickable" onClick={ (event)=>{ this.SortRecords('DateAdded') } }>Date d'ajout</th>
					<th className="clickable" onClick={ (event)=>{ this.SortRecords('Postcode') } }	>Code Postale</th>
					<th className="clickable" onClick={ (event)=>{ this.SortRecords('IP') } }		>Address IP</th>
				</tr>
			</thead>
		);
		
		if (!this.state.HaveRecord)
		{
			return (
				<table id="ContactTable">
					{Header}
					<tbody>
					</tbody>
				</table> 
			);
		}

		let Table = (
			<table id="ContactTable">
				{Header}
				<tbody>
					{Rows}
				</tbody>
			</table> 
		);
		
		return Table;
	};
}

const domContainer = document.querySelector('#container');
const root = ReactDOM.createRoot(domContainer);
//root.render(e(RegisterForm));
root.render(<RecordEditorTable/>);
