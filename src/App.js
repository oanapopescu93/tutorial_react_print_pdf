//aaa01
import IdrExport from './idr-export'
import Tiger from './oana'

function App() {
  Tiger;
  return (
    <div className="App">
        <IdrExport button_name={"Export"} company={'CompanyName'} name_pdf={"Event_001"} landscape ='portrait' div_id="printing_area"></IdrExport>
        <Tiger></Tiger>
    </div>    
  );
}

export default App;