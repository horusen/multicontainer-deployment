import "./App.css";
import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { OtherPage } from "./OtherPage";
import Fib from "./Fib";

class App extends Component {
	render() {
		return (
			<Router>
				<div className="App">
					<header>
						<Link to="/">Home</Link>
						<Link to="/otherpage">Other Page</Link>
					</header>
					<div>
						<Routes>
							<Route exact path="/" element={<Fib />} />
							<Route exact path="/otherpage" element={<OtherPage />} />
						</Routes>
					</div>
				</div>
			</Router>
		);
	}
}
export default App;
