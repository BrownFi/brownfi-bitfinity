import { Buffer } from "buffer";

import { useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { ConfigProvider, Layout, theme } from "antd";

import { GlobalProvider } from "./context/GlobalProvider";
import { CustomFooter, CustomHeader, MainContent } from "./layout";
import { publicRoutes } from "./routes";
import { StarknetProvider } from "./starknet-provider";
import "./styles/App.css";

const styles = {
  layout: {
    width: "100vw",
    height: "100vh",
    overflow: "auto",
    fontFamily: "Montserrat, sans-serif",
  },
} as const;

function App() {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const [isDarkMode, setIsDarkMode] = useState(true);
  if (!window.Buffer) window.Buffer = Buffer;

  return (
    <Router>
      <StarknetProvider>
        <GlobalProvider>
          <ConfigProvider
            theme={{
              algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
            }}
          >
            <Layout style={styles.layout}>
              <CustomHeader
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
              <MainContent>
                <Routes>
                  {publicRoutes.map((route, index) => {
                    const Page = route.element;
                    return (
                      <Route
                        key={index}
                        path={route.path}
                        element={<Page />}
                      ></Route>
                    );
                  })}
                </Routes>
              </MainContent>
              <CustomFooter />
            </Layout>
          </ConfigProvider>
        </GlobalProvider>
      </StarknetProvider>
    </Router>
  );
}

export default App;
