declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DATABASE_NAME: string,
        DATABASE_USERNAME: string,
        DATABASE_PASSWORD: string,
        NODE_ENV: "production" | "development" | "test"
      }
    }
  }
  
  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
  export {}