/* Pandas Rapid Fire question bank, loaded by pandas-rapid-fire-quiz.html.

   Q(id, stage, difficulty, question, context, accept, learn, acceptRegex?)
   - stage and difficulty are internal: they drive sampling and the timer and are never shown.
   - accept: every reasonable correct form; accept[0] is the idiomatic one and is shown as "the" answer.
   - acceptRegex: optional regexes tested against the *normalised* answer (no spaces, ' quotes,
     df.col → df['col'], keyword arguments sorted). Use only when variants can't be listed.
   Keep the mix at about 25% easy / 50% medium / 25% hard (see AGENTS.md). */
(function () {
  const B = [];
  function Q(id, stage, difficulty, q, ctx, accept, learn, acceptRegex) {
    B.push({ id, stage, difficulty, q, ctx, accept, learn, acceptRegex });
  }

  const IMPORTS = "import pandas as pd";
  const EMP = "df.columns → ['name', 'dept', 'salary', 'age', 'city', 'join_date']";
  const SALES = "df.columns → ['order_id', 'cust_id', 'date', 'region', 'product', 'qty', 'price']";
  const SALES_REV = "df.columns → ['order_id', 'cust_id', 'date', 'region', 'product', 'revenue']\ndf['date'].dtype → datetime64[ns]";
  const ORD_CUST = "orders.columns    → ['order_id', 'cust_id', 'qty']\ncustomers.columns → ['cust_id', 'name', 'segment']";
  const CONTACTS = "df.columns → ['email', 'phone', 'full_name', 'active', 'updated_at']";
  const TS = "df.columns → ['date', 'sales']   one row per day, sorted by date\ndf['date'].dtype → datetime64[ns]";
  const TSI = "df.index → DatetimeIndex, one row per day, sorted\ndf.columns → ['sales']";
  const WIDE = "df.columns → ['id', 'jan', 'feb', 'mar']   (wide: one column per month)";
  const GROUPED = "s = df.groupby(['region', 'product'])['revenue'].sum()   # Series with a 2-level index";
  const AB = "a.columns → ['id', 'score', 'city']\nb.columns → ['id', 'score', 'team']";

  /* ======================= LOAD ======================= */
  Q('read-csv', 'load', 'easy', "Load 'sales.csv' into a DataFrame called df.", IMPORTS,
    ["df = pd.read_csv('sales.csv')"],
    "pd.read_csv(path) → DataFrame. Handy args: usecols=, dtype=, parse_dates=, nrows= for a quick peek.");
  Q('read-excel', 'load', 'easy', "Load the sheet 'Q1' from 'sales.xlsx' into df.", IMPORTS,
    ["df = pd.read_excel('sales.xlsx', sheet_name='Q1')"],
    "read_excel needs openpyxl for .xlsx. sheet_name=None loads every sheet into a dict of DataFrames.");
  Q('read-json', 'load', 'easy', "Load 'events.json' (a JSON array of records) into df.", IMPORTS,
    ["df = pd.read_json('events.json')"],
    "read_json reads an array of objects into rows. For one JSON object per line (JSON Lines), add lines=True.");
  Q('df-from-dict', 'load', 'easy', "Build df from the dict data.", "data = {'a': [1, 2], 'b': [3, 4]}",
    ["df = pd.DataFrame(data)"],
    "pd.DataFrame(dict_of_lists) makes one column per key. A list of dicts gives one row per dict.");
  Q('read-parquet', 'load', 'easy', "Load 'sales.parquet' into df.", IMPORTS,
    ["df = pd.read_parquet('sales.parquet')"],
    "Parquet is columnar and keeps dtypes, so it loads much faster than CSV. columns=[...] reads only what you need.");
  Q('read-csv-usecols', 'load', 'medium', "Load only the 'date' and 'revenue' columns of 'sales.csv' into df.", IMPORTS,
    ["df = pd.read_csv('sales.csv', usecols=['date', 'revenue'])", "df = pd.read_csv('sales.csv', usecols=['revenue', 'date'])"],
    "usecols= skips the other columns while parsing, saving time and memory on wide files.");
  Q('read-tsv', 'load', 'medium', "Load the tab-separated file 'data.tsv' into df.", IMPORTS,
    ["df = pd.read_csv('data.tsv', sep='\\t')", "df = pd.read_csv('data.tsv', delimiter='\\t')", "df = pd.read_table('data.tsv')"],
    "read_csv handles any delimiter via sep= ('\\t', ';', '|'). read_table is read_csv with sep='\\t'.");
  Q('read-csv-dates', 'load', 'medium', "Load 'sales.csv' into df, parsing the 'date' column as datetime.", IMPORTS,
    ["df = pd.read_csv('sales.csv', parse_dates=['date'])"],
    "parse_dates=[cols] converts while loading, so .dt works straight away. Add date_format= for an unusual layout.");
  Q('read-csv-index', 'load', 'medium', "Load 'sales.csv' into df with 'order_id' as the index.", IMPORTS,
    ["df = pd.read_csv('sales.csv', index_col='order_id')", "df = pd.read_csv('sales.csv').set_index('order_id')"],
    "index_col= sets the index while loading; index_col=0 uses the first column, e.g. a CSV saved with its index.");
  Q('read-csv-dtype', 'load', 'medium', "Load 'sales.csv' into df, reading 'cust_id' as text so leading zeros survive.", IMPORTS,
    ["df = pd.read_csv('sales.csv', dtype={'cust_id': str})", "df = pd.read_csv('sales.csv', dtype={'cust_id': 'str'})", "df = pd.read_csv('sales.csv', dtype={'cust_id': 'string'})"],
    "dtype={col: str} stops pandas guessing numbers, so IDs like '00123' keep their zeros.");
  Q('read-csv-na', 'load', 'medium', "Load 'sales.csv' into df, treating '-' and 'N/A' as missing values.", IMPORTS,
    ["df = pd.read_csv('sales.csv', na_values=['-', 'N/A'])", "df = pd.read_csv('sales.csv', na_values=['N/A', '-'])"],
    "na_values= adds extra markers to pandas' default missing set ('', 'NA', 'NaN', 'null', …).");
  Q('read-sql', 'load', 'medium', "Load every row of the table 'orders' into df, using the connection conn.", "import sqlite3\nconn = sqlite3.connect('shop.db')",
    ["df = pd.read_sql('SELECT * FROM orders', conn)", "df = pd.read_sql('select * from orders', conn)", "df = pd.read_sql_query('SELECT * FROM orders', conn)", "df = pd.read_sql_query('select * from orders', conn)"],
    "pd.read_sql(query, conn) runs SQL and returns a DataFrame. Use params= for values instead of formatting them into the string.");
  Q('read-csv-chunks', 'load', 'hard', "Create reader, an iterator over 'big.csv' in chunks of 100,000 rows.", IMPORTS,
    ["reader = pd.read_csv('big.csv', chunksize=100000)"],
    "chunksize= returns an iterator of DataFrames, so files bigger than memory can be processed piece by piece in a for loop.");
  Q('read-csv-skip', 'load', 'hard', "Load 'report.csv' into df, skipping its first 3 lines of notes and its last 2 footer lines.", IMPORTS,
    ["df = pd.read_csv('report.csv', skiprows=3, skipfooter=2, engine='python')", "df = pd.read_csv('report.csv', skiprows=3, skipfooter=2)"],
    "skiprows= drops lines at the top; skipfooter= drops lines at the bottom and needs engine='python' (pandas switches with a warning).");

  /* ======================= INSPECT ======================= */
  Q('head', 'inspect', 'easy', "Show the first 5 rows of df.", EMP,
    ["df.head()"],
    "df.head() defaults to n=5; df.tail() shows the last rows; df.sample(5) random rows.");
  Q('tail', 'inspect', 'easy', "Show the last 3 rows of df.", EMP,
    ["df.tail(3)", "df.tail(n=3)", "df.iloc[-3:]"],
    "tail(n) mirrors head(n). Handy after sorting to see the bottom of a ranking.");
  Q('shape', 'inspect', 'easy', "Get the number of rows and columns of df as a tuple.", EMP,
    ["df.shape"],
    "df.shape is an attribute (no parentheses) → (rows, cols). len(df) gives the row count only.");
  Q('row-count', 'inspect', 'easy', "Get the number of rows in df.", EMP,
    ["len(df)", "df.shape[0]", "len(df.index)"],
    "len(df) counts rows. df.size is rows × columns, and df.count() counts non-missing values per column.");
  Q('dtypes', 'inspect', 'easy', "Show the data type of every column.", EMP,
    ["df.dtypes"],
    "df.dtypes is a Series of column → dtype. Text columns show as object (or string); check dates aren't still object.");
  Q('info', 'inspect', 'easy', "Print one summary of the columns, their non-null counts and dtypes.", EMP,
    ["df.info()"],
    "info() is the first look at a new frame: row count, non-null counts (missing data), dtypes and memory.");
  Q('describe', 'inspect', 'easy', "Get count, mean, std, min, quartiles and max for the numeric columns.", EMP,
    ["df.describe()"],
    "describe() summarises numeric columns. Compare mean with the median (50%) to spot skew.");
  Q('columns', 'inspect', 'easy', "Get the column names of df.", EMP,
    ["df.columns", "df.columns.tolist()", "list(df.columns)", "df.columns.to_list()"],
    "df.columns is an Index; .tolist() makes it a plain list. Assign to df.columns to rename all of them at once.");
  Q('value-counts', 'inspect', 'medium', "How many employees are in each dept?", EMP,
    ["df['dept'].value_counts()", "df.groupby('dept').size()"],
    "value_counts() counts each distinct value, sorted descending; normalize=True gives shares, dropna=False counts NaN too.");
  Q('nulls', 'inspect', 'medium', "Count the missing values in every column.", EMP,
    ["df.isna().sum()"],
    "isna() returns a boolean frame; .sum() counts True per column. isnull() is an alias; .mean() gives the share missing.");
  Q('nunique', 'inspect', 'medium', "How many distinct cities are there?", EMP,
    ["df['city'].nunique()", "len(df['city'].unique())"],
    "nunique() ignores NaN by default (dropna=False counts it). df.nunique() does every column at once.");
  Q('unique', 'inspect', 'medium', "Get an array of the distinct values in 'dept'.", EMP,
    ["df['dept'].unique()"],
    "unique() keeps first-seen order and includes NaN. drop_duplicates() does the same but returns a Series.");
  Q('describe-all', 'inspect', 'medium', "Get summary statistics for every column, including the text columns.", EMP,
    ["df.describe(include='all')"],
    "include='all' adds count, unique, top and freq for text columns. include='object' gives only the text ones.");
  Q('null-share', 'inspect', 'medium', "Get the share (0 to 1) of missing values in each column.", EMP,
    ["df.isna().mean()"],
    "The mean of a boolean is the share of True values, so isna().mean() is the missing rate per column.");
  Q('rows-with-null', 'inspect', 'medium', "How many rows have at least one missing value?", EMP,
    ["df.isna().any(axis=1).sum()", "len(df) - len(df.dropna())", "df.isna().any(axis='columns').sum()"],
    "any(axis=1) checks across each row. axis=0 (the default) would check down each column instead.");
  Q('dup-count', 'inspect', 'medium', "How many rows are exact duplicates of an earlier row?", EMP,
    ["df.duplicated().sum()"],
    "duplicated() marks repeats after the first occurrence; subset=['col'] checks a key instead of the whole row.");
  Q('corr', 'inspect', 'medium', "Get the correlation matrix of the numeric columns.", EMP,
    ["df.corr(numeric_only=True)", "df.select_dtypes('number').corr()", "df.select_dtypes(include='number').corr()"],
    "Since pandas 2.0, corr() raises on text columns unless numeric_only=True. method='spearman' ranks first.");
  Q('sample', 'inspect', 'medium', "Show 5 random rows, reproducibly, using seed 42.", EMP,
    ["df.sample(5, random_state=42)", "df.sample(n=5, random_state=42)"],
    "random_state= fixes the draw so it repeats. frac=0.1 samples 10% of rows instead of a count.");
  Q('quantile', 'inspect', 'medium', "Get the 90th percentile of salary.", EMP,
    ["df['salary'].quantile(0.9)", "df['salary'].quantile(0.90)", "df['salary'].quantile(q=0.9)"],
    "quantile(q) takes a fraction from 0 to 1. Pass a list, e.g. [0.25, 0.5, 0.75], for several at once.");
  Q('memory', 'inspect', 'hard', "Get the total memory df uses in bytes, counting the contents of text columns.", EMP,
    ["df.memory_usage(deep=True).sum()"],
    "Without deep=True, object columns count only their pointers. Converting repetitive text to category often saves a lot.");
  Q('vc-bins', 'inspect', 'hard', "Count how many salaries fall into each of 4 equal-width bins.", EMP,
    ["df['salary'].value_counts(bins=4)", "pd.cut(df['salary'], 4).value_counts()", "pd.cut(df['salary'], bins=4).value_counts()"],
    "value_counts(bins=n) is a quick histogram as a table. It's shorthand for pd.cut(...).value_counts().");

  /* ======================= SELECT & FILTER ======================= */
  Q('single-col', 'select', 'easy', "Select the 'salary' column as a Series.", EMP,
    ["df['salary']"],
    "df['col'] always works; df.col breaks on names with spaces or that clash with methods (count, size, name).");
  Q('select-cols', 'select', 'easy', "Select just the 'name' and 'salary' columns.", EMP,
    ["df[['name', 'salary']]", "df.loc[:, ['name', 'salary']]"],
    "Double brackets: the inner list picks columns and returns a DataFrame. df['salary'] alone returns a Series.");
  Q('iloc-first', 'select', 'easy', "Select the first row by position.", EMP,
    ["df.iloc[0]"],
    "iloc is by position, loc by label. df.iloc[0] returns a Series; df.iloc[[0]] keeps it a one-row DataFrame.");
  Q('iloc-slice', 'select', 'easy', "Select the rows at positions 10 to 19 (10 rows).", EMP,
    ["df.iloc[10:20]"],
    "iloc slices exclude the end, like Python lists. loc label slices include the end label.");
  Q('loc-scalar', 'select', 'easy', "Get the 'salary' value of the row labelled 3.", EMP,
    ["df.loc[3, 'salary']", "df.at[3, 'salary']"],
    "loc[row_label, col] gets one cell; at[] is a faster scalar-only version. Avoid df['salary'][3] chained indexing.");
  Q('simple-filter', 'select', 'easy', "Keep rows where salary is above 50000.", EMP,
    ["df[df['salary'] > 50000]", "df.loc[df['salary'] > 50000]", "df.query('salary > 50000')"],
    "A comparison gives a boolean Series (a mask); df[mask] keeps the True rows.");
  Q('drop-row', 'select', 'easy', "Drop the row labelled 0.", EMP,
    ["df.drop(0)", "df.drop(index=0)", "df.drop([0])", "df.drop(index=[0])"],
    "drop() removes by label and returns a new frame. Use columns= to drop columns instead.");
  Q('bool-filter', 'select', 'medium', "Keep rows where age is over 30 and city is 'Delhi'.", EMP,
    ["df[(df['age'] > 30) & (df['city'] == 'Delhi')]", "df[(df['city'] == 'Delhi') & (df['age'] > 30)]",
     "df.loc[(df['age'] > 30) & (df['city'] == 'Delhi')]", "df.loc[(df['city'] == 'Delhi') & (df['age'] > 30)]",
     `df.query("age > 30 and city == 'Delhi'")`, `df.query("age > 30 & city == 'Delhi'")`, `df.query("city == 'Delhi' and age > 30")`],
    "Combine masks with & / | (not and / or) and wrap each condition in parentheses: & binds tighter than > and ==. df.query() is the readable alternative.");
  Q('or-filter', 'select', 'medium', "Keep rows where dept is 'HR' or age is under 25.", EMP,
    ["df[(df['dept'] == 'HR') | (df['age'] < 25)]", "df[(df['age'] < 25) | (df['dept'] == 'HR')]",
     "df.loc[(df['dept'] == 'HR') | (df['age'] < 25)]", "df.loc[(df['age'] < 25) | (df['dept'] == 'HR')]",
     `df.query("dept == 'HR' or age < 25")`, `df.query("dept == 'HR' | age < 25")`],
    "| is element-wise OR. Python's or tries to turn the whole Series into one bool and raises 'truth value is ambiguous'.");
  Q('isin', 'select', 'medium', "Keep rows where city is 'Delhi' or 'Mumbai', using a single membership test.", EMP,
    ["df[df['city'].isin(['Delhi', 'Mumbai'])]", "df[df['city'].isin(['Mumbai', 'Delhi'])]",
     "df.loc[df['city'].isin(['Delhi', 'Mumbai'])]", "df.loc[df['city'].isin(['Mumbai', 'Delhi'])]"],
    "Series.isin(list) is pandas' SQL IN (...): cleaner than chaining == with |. Negate with ~df['city'].isin(...).");
  Q('not-isin', 'select', 'medium', "Keep rows where city is neither 'Delhi' nor 'Mumbai'.", EMP,
    ["df[~df['city'].isin(['Delhi', 'Mumbai'])]", "df[~df['city'].isin(['Mumbai', 'Delhi'])]",
     "df.loc[~df['city'].isin(['Delhi', 'Mumbai'])]", "df.loc[~df['city'].isin(['Mumbai', 'Delhi'])]"],
    "~ inverts a boolean mask (NOT). Use it instead of Python's not, which doesn't work element-wise.");
  Q('isin-var', 'select', 'medium', "Keep rows whose city is in the list top_cities.", EMP + "\ntop_cities = ['Delhi', 'Pune']",
    ["df[df['city'].isin(top_cities)]", "df.loc[df['city'].isin(top_cities)]", "df.query('city in @top_cities')"],
    "isin accepts any list, set or Series. Inside query(), refer to Python variables with @name.");
  Q('between', 'select', 'medium', "Keep rows where age is between 25 and 35, inclusive.", EMP,
    ["df[df['age'].between(25, 35)]", "df[(df['age'] >= 25) & (df['age'] <= 35)]", "df.loc[df['age'].between(25, 35)]", "df.query('25 <= age <= 35')"],
    "between(lo, hi) includes both ends by default; inclusive='left', 'right' or 'neither' changes that.");
  Q('contains', 'select', 'medium', "Keep rows where name contains 'Kumar'.", EMP,
    ["df[df['name'].str.contains('Kumar')]", "df[df['name'].str.contains('Kumar', na=False)]", "df.loc[df['name'].str.contains('Kumar')]"],
    "str.contains treats the pattern as a regex by default (regex=False for literal text); case=False ignores case; na=False makes missing names False.");
  Q('startswith', 'select', 'medium', "Keep rows where city starts with 'B'.", EMP,
    ["df[df['city'].str.startswith('B')]", "df.loc[df['city'].str.startswith('B')]"],
    "str.startswith / str.endswith take a string or a tuple of strings: str.startswith(('B', 'C')).");
  Q('notna-filter', 'select', 'medium', "Keep rows where salary is not missing.", EMP,
    ["df[df['salary'].notna()]", "df.dropna(subset=['salary'])", "df.loc[df['salary'].notna()]"],
    "notna() is the opposite of isna(). Comparing with == np.nan never works, because NaN isn't equal to itself.");
  Q('loc-filter-col', 'select', 'medium', "Get the 'name' column for employees older than 40.", EMP,
    ["df.loc[df['age'] > 40, 'name']", "df[df['age'] > 40]['name']"],
    "loc[row_mask, columns] filters rows and picks columns in one step. It's the safe way to set values too.");
  Q('select-dtypes', 'select', 'medium', "Keep only the numeric columns.", EMP,
    ["df.select_dtypes('number')", "df.select_dtypes(include='number')", "df.select_dtypes(include=['number'])", "df.select_dtypes(include=np.number)"],
    "select_dtypes(include=/exclude=) picks columns by type: 'number', 'object', 'category', 'datetime'.");
  Q('drop-cols', 'select', 'medium', "Drop the 'age' and 'city' columns.", EMP,
    ["df.drop(columns=['age', 'city'])", "df.drop(columns=['city', 'age'])", "df.drop(['age', 'city'], axis=1)", "df.drop(['city', 'age'], axis=1)"],
    "drop(columns=[...]) is clearer than axis=1. errors='ignore' skips names that don't exist.");
  Q('nlargest', 'select', 'medium', "Get the 3 highest-paid rows.", EMP,
    ["df.nlargest(3, 'salary')", "df.sort_values('salary', ascending=False).head(3)",
     "df.nlargest(n=3, columns='salary')", "df.sort_values(by='salary', ascending=False).head(3)"],
    "nlargest(n, col) is a fast top-n; sort_values(col, ascending=False).head(n) is the general pattern.");
  Q('nsmallest', 'select', 'medium', "Get the 5 youngest employees.", EMP,
    ["df.nsmallest(5, 'age')", "df.sort_values('age').head(5)", "df.nsmallest(n=5, columns='age')", "df.sort_values(by='age').head(5)"],
    "nsmallest mirrors nlargest. keep='all' keeps every row tied at the cut-off.");
  Q('last-col', 'select', 'medium', "Select the last column, by position.", EMP,
    ["df.iloc[:, -1]"],
    "iloc[rows, cols] takes positions; ':' means all rows, and negative positions count from the end.");
  Q('top-per-group', 'select', 'hard', "Get the full row of the highest-paid employee in each dept.", EMP,
    ["df.loc[df.groupby('dept')['salary'].idxmax()]", "df.sort_values('salary', ascending=False).drop_duplicates('dept')",
     "df.sort_values('salary', ascending=False).drop_duplicates(subset=['dept'])", "df.sort_values('salary', ascending=False).drop_duplicates(subset='dept')"],
    "groupby(...).idxmax() returns the index label of each group's max; loc[] then fetches those whole rows.");
  Q('query-var', 'select', 'hard', "Use query() to keep rows where age is at least min_age.", EMP + "\nmin_age = 30",
    ["df.query('age >= @min_age')"],
    "Inside a query string, @name refers to a Python variable. Backticks quote column names with spaces: `first name`.");

  /* ======================= CLEAN ======================= */
  Q('dropna', 'clean', 'easy', "Drop every row that has any missing value, keeping the result in df.", EMP,
    ["df = df.dropna()", "df.dropna(inplace=True)", "df = df.dropna(how='any')"],
    "dropna() returns a new frame, so reassign it (or use inplace=True). subset=['col'] limits the check; how='all' drops only fully empty rows.");
  Q('fillna-zero', 'clean', 'easy', "Replace every missing value in df with 0, keeping the result in df.", EMP,
    ["df = df.fillna(0)", "df.fillna(0, inplace=True)"],
    "fillna(value) fills every column. Pass a dict, {'col': value}, to fill each column differently.");
  Q('fillna-unknown', 'clean', 'easy', "Fill missing values in 'city' with 'Unknown' (overwrite the column).", EMP,
    ["df['city'] = df['city'].fillna('Unknown')", "df = df.fillna({'city': 'Unknown'})"],
    "Assign the filled column back. df['city'].fillna(..., inplace=True) is chained assignment and is deprecated in pandas 2.x.");
  Q('astype-int', 'clean', 'easy', "Convert 'age' to integers (overwrite the column).", EMP,
    ["df['age'] = df['age'].astype(int)", "df['age'] = df['age'].astype('int')", "df['age'] = df['age'].astype('int64')", "df['age'] = df['age'].astype(np.int64)"],
    "astype(int) fails if there are NaN values; use astype('Int64') (capital I), the nullable integer type, in that case.");
  Q('rename', 'clean', 'easy', "Rename the column 'salary' to 'pay', keeping the result in df.", EMP,
    ["df = df.rename(columns={'salary': 'pay'})", "df.rename(columns={'salary': 'pay'}, inplace=True)"],
    "rename(columns={old: new}) changes only the names you list. Plain rename({...}) without columns= renames index labels.");
  Q('fillna-median', 'clean', 'medium', "Fill missing values in 'salary' with the salary median (overwrite the column).", EMP,
    ["df['salary'] = df['salary'].fillna(df['salary'].median())", "df = df.fillna({'salary': df['salary'].median()})"],
    "Median imputation resists outliers. Assign the result back: df['col'].fillna(..., inplace=True) is chained assignment and is deprecated in pandas 2.x.");
  Q('dropna-subset', 'clean', 'medium', "Drop rows where 'salary' is missing, keeping the result in df.", EMP,
    ["df = df.dropna(subset=['salary'])", "df.dropna(subset=['salary'], inplace=True)", "df = df.dropna(subset='salary')", "df = df[df['salary'].notna()]"],
    "subset= limits which columns are checked; without it, a missing value in any column drops the row.");
  Q('dropna-thresh', 'clean', 'medium', "Keep only rows with at least 4 non-missing values, keeping the result in df.", EMP,
    ["df = df.dropna(thresh=4)", "df.dropna(thresh=4, inplace=True)"],
    "thresh=n keeps rows with at least n non-missing values. It can't be combined with how=.");
  Q('drop-dupes', 'clean', 'medium', "Remove duplicate rows, keeping the first occurrence; keep the result in df.", EMP,
    ["df = df.drop_duplicates()", "df = df.drop_duplicates(keep='first')", "df.drop_duplicates(inplace=True)", "df.drop_duplicates(keep='first', inplace=True)"],
    "drop_duplicates() compares whole rows by default; subset=['col'] dedupes on a key; keep='last' or keep=False change which rows survive.");
  Q('dedupe-subset', 'clean', 'medium', "Remove rows with a repeated 'email', keeping the last one; keep the result in df.", CONTACTS,
    ["df = df.drop_duplicates(subset=['email'], keep='last')", "df = df.drop_duplicates(subset='email', keep='last')", "df = df.drop_duplicates('email', keep='last')", "df.drop_duplicates(subset=['email'], keep='last', inplace=True)"],
    "subset= decides what counts as a duplicate; keep='last' keeps the final occurrence in current row order.");
  Q('to-datetime', 'clean', 'medium', "'join_date' holds strings like '2024-03-15'. Convert the column to datetime.", EMP,
    ["df['join_date'] = pd.to_datetime(df['join_date'])", "df['join_date'] = pd.to_datetime(df['join_date'], format='%Y-%m-%d')"],
    "pd.to_datetime turns strings into datetime64, which unlocks .dt, date filtering and resampling. errors='coerce' turns unparseable values into NaT.");
  Q('to-datetime-dayfirst', 'clean', 'medium', "'date' holds strings like '15/03/2024' (day first). Convert the column to datetime.", SALES,
    ["df['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y')", "df['date'] = pd.to_datetime(df['date'], dayfirst=True)"],
    "Give format= whenever you know it: it's faster and never confuses 3 March with 15 March. dayfirst=True is the looser option.");
  Q('to-numeric', 'clean', 'medium', "'qty' holds strings, some like 'n/a'. Convert it to numbers, turning bad values into NaN (overwrite).", SALES,
    ["df['qty'] = pd.to_numeric(df['qty'], errors='coerce')"],
    "errors='coerce' turns anything unparseable into NaN, where astype(float) would raise. Check isna().sum() afterwards.");
  Q('to-category', 'clean', 'medium', "Convert 'dept' to the category dtype (overwrite).", EMP,
    ["df['dept'] = df['dept'].astype('category')"],
    "category stores each distinct value once: less memory and faster groupby for low-cardinality text.");
  Q('str-clean', 'clean', 'medium', "Clean 'city': strip surrounding spaces and make it lowercase (overwrite the column).", EMP,
    ["df['city'] = df['city'].str.strip().str.lower()", "df['city'] = df['city'].str.lower().str.strip()"],
    "The .str accessor vectorises string methods, and every call needs its own .str: df['c'].str.strip().str.lower().");
  Q('lower-cols', 'clean', 'medium', "Make all column names lowercase.", "df.columns → ['Name', 'Dept', 'Salary']",
    ["df.columns = df.columns.str.lower()", "df = df.rename(columns=str.lower)", "df.columns = [c.lower() for c in df.columns]"],
    "df.columns supports the .str accessor too. rename(columns=func) applies a function to every name.",
    [/^df\['columns'\]=\[(\w+)\.lower\(\)for\1indf\['columns'\]\]$/]);
  Q('replace-value', 'clean', 'medium', "In 'city', replace 'Bombay' with 'Mumbai' (overwrite the column).", EMP,
    ["df['city'] = df['city'].replace('Bombay', 'Mumbai')", "df['city'] = df['city'].replace({'Bombay': 'Mumbai'})"],
    "replace matches whole values by default; regex=True or .str.replace changes substrings instead.");
  Q('ffill', 'clean', 'medium', "Fill missing 'price' values with the previous row's value (overwrite).", SALES,
    ["df['price'] = df['price'].ffill()", "df['price'] = df['price'].fillna(method='ffill')"],
    "ffill() carries the last valid value forward; bfill() pulls the next one back. fillna(method=) is deprecated since 2.1.");
  Q('interpolate', 'clean', 'medium', "Fill gaps in 'sales' by linear interpolation (overwrite).", TS,
    ["df['sales'] = df['sales'].interpolate()", "df['sales'] = df['sales'].interpolate(method='linear')"],
    "interpolate() draws a straight line between known neighbours. With a DatetimeIndex, method='time' weights by the gap length.");
  Q('cap-salary', 'clean', 'medium', "Cap salaries above 200000 at 200000 (overwrite the column).", EMP,
    ["df['salary'] = df['salary'].clip(upper=200000)", "df['salary'] = df['salary'].where(df['salary'] <= 200000, 200000)", "df['salary'] = df['salary'].mask(df['salary'] > 200000, 200000)"],
    "clip(lower=, upper=) bounds values. where(cond, other) keeps values where cond is True; mask() is its inverse.");
  Q('empty-to-nan', 'clean', 'medium', "Turn empty strings '' anywhere in df into NaN, keeping the result in df.", EMP,
    ["df = df.replace('', np.nan)", "df = df.replace('', pd.NA)", "df.replace('', np.nan, inplace=True)"],
    "Empty strings aren't counted as missing. Replace them with NaN so isna(), dropna() and fillna() see them.");
  Q('yes-no-bool', 'clean', 'medium', "'active' holds 'yes'/'no'. Convert it to True/False (overwrite).", CONTACTS,
    ["df['active'] = df['active'].map({'yes': True, 'no': False})", "df['active'] = df['active'].map({'no': False, 'yes': True})", "df['active'] = df['active'] == 'yes'", "df['active'] = df['active'].eq('yes')"],
    "map(dict) translates values, and anything unexpected becomes NaN, which flags dirty data; == 'yes' silently turns it into False.");
  Q('price-clean', 'clean', 'hard', "Convert 'price' to float (overwrite the column).", "df['price'].head(3) → ['$1,299.00', '$89.50', '$12.00']   dtype: object",
    ["df['price'] = df['price'].str.replace('[$,]', '', regex=True).astype(float)",
     "df['price'] = df['price'].str.replace('$', '').str.replace(',', '').astype(float)",
     "df['price'] = df['price'].str.replace(',', '').str.replace('$', '').astype(float)"],
    "Strip symbols with .str.replace (regex=True for a character class like '[$,]'), then .astype(float), or pd.to_numeric(errors='coerce') to turn leftovers into NaN.",
    [/^df\['price'\]=(pd\.to_numeric\(df\['price'\]\['str'\]\.replace\('\[(\\?\$,|,\\?\$)\]','',regex=True\)\)|df\['price'\]\['str'\]\.replace\('\[(\\?\$,|,\\?\$)\]','',regex=True\)\.astype\(float\))$/]);
  Q('fillna-group', 'clean', 'hard', "Fill missing 'salary' values with the mean salary of that row's dept (overwrite).", EMP,
    ["df['salary'] = df['salary'].fillna(df.groupby('dept')['salary'].transform('mean'))"],
    "transform('mean') gives each row its group's mean, aligned to df, so fillna can use it row by row.");
  Q('phone-digits', 'clean', 'hard', "Keep only the digits in 'phone' (overwrite).", "df['phone'].head(2) → ['(022) 555-0101', '+91 98200 12345']",
    ["df['phone'] = df['phone'].str.replace(r'\\D', '', regex=True)", "df['phone'] = df['phone'].str.replace('[^0-9]', '', regex=True)", "df['phone'] = df['phone'].str.replace(r'[^\\d]', '', regex=True)"],
    "\\D matches any non-digit. Since pandas 2.0, str.replace is literal by default, so regex=True is required for patterns.");
  Q('clip-quantile', 'clean', 'hard', "Cap 'salary' at its 1st and 99th percentiles (overwrite).", EMP,
    ["df['salary'] = df['salary'].clip(df['salary'].quantile(0.01), df['salary'].quantile(0.99))",
     "df['salary'] = df['salary'].clip(lower=df['salary'].quantile(0.01), upper=df['salary'].quantile(0.99))"],
    "Winsorising: clip to percentiles to tame outliers without dropping rows.");
  Q('dedupe-latest', 'clean', 'hard', "Keep only the most recent row (by 'updated_at') for each email.", CONTACTS,
    ["df.sort_values('updated_at').drop_duplicates('email', keep='last')",
     "df.sort_values('updated_at').drop_duplicates(subset=['email'], keep='last')",
     "df.sort_values('updated_at').drop_duplicates(subset='email', keep='last')",
     "df.sort_values('updated_at', ascending=False).drop_duplicates('email')",
     "df.sort_values('updated_at', ascending=False).drop_duplicates(subset=['email'])",
     "df.loc[df.groupby('email')['updated_at'].idxmax()]"],
    "Sort so the row you want comes last (or first), then drop_duplicates on the key with the matching keep=.");
  Q('split-name', 'clean', 'hard', "Split 'full_name' at the first space into new columns 'first' and 'last'.", CONTACTS,
    ["df[['first', 'last']] = df['full_name'].str.split(' ', n=1, expand=True)", "df[['first', 'last']] = df['full_name'].str.split(n=1, expand=True)"],
    "expand=True returns a DataFrame you can assign to several columns; n=1 splits only once, so middle names stay in 'last'.");

  /* ======================= TRANSFORM ======================= */
  Q('const-col', 'transform', 'easy', "Add a column 'country' set to 'India' for every row.", EMP,
    ["df['country'] = 'India'"],
    "Assigning a scalar broadcasts it to every row.");
  Q('col-div', 'transform', 'easy', "Add 'salary_k': salary divided by 1000.", EMP,
    ["df['salary_k'] = df['salary'] / 1000"],
    "Arithmetic on a column applies to every row, vectorised; no loop needed.");
  Q('bool-col', 'transform', 'easy', "Add 'is_senior': True when age is 50 or more.", EMP,
    ["df['is_senior'] = df['age'] >= 50", "df['is_senior'] = df['age'].ge(50)"],
    "A comparison returns a boolean column directly; no if/else needed.");
  Q('revenue-col', 'transform', 'easy', "Add a column 'revenue' equal to qty × price.", SALES,
    ["df['revenue'] = df['qty'] * df['price']", "df['revenue'] = df['price'] * df['qty']",
     "df = df.assign(revenue=df['qty'] * df['price'])", "df = df.assign(revenue=df['price'] * df['qty'])"],
    "Arithmetic between columns runs row by row, vectorised: no loop or apply needed. assign() returns a new frame and chains nicely.");
  Q('upper', 'transform', 'easy', "Make 'city' uppercase (overwrite).", EMP,
    ["df['city'] = df['city'].str.upper()"],
    "String methods live under .str: upper, lower, title, strip, len, replace, contains….");
  Q('round', 'transform', 'easy', "Round 'price' to 2 decimal places (overwrite).", SALES,
    ["df['price'] = df['price'].round(2)"],
    "round(n) rounds half to even (2.5 → 2). df.round({'a': 1, 'b': 0}) rounds each column differently.");
  Q('sort-desc', 'transform', 'easy', "Sort df by salary, highest first.", EMP,
    ["df.sort_values('salary', ascending=False)", "df.sort_values(by='salary', ascending=False)"],
    "sort_values returns a new frame; NaN goes last unless na_position='first'.");
  Q('reset-index', 'transform', 'easy', "Renumber the index 0…n-1, discarding the old index.", EMP,
    ["df.reset_index(drop=True)"],
    "Without drop=True, the old index becomes a column. Do this after filtering or sorting if you want clean positions.");
  Q('set-index', 'transform', 'easy', "Make 'order_id' the index, keeping the result in df.", SALES,
    ["df = df.set_index('order_id')", "df.set_index('order_id', inplace=True)"],
    "set_index moves a column into the index; reset_index moves it back. Then df.loc[some_id] looks rows up by id.");
  Q('dt-year', 'transform', 'medium', "Add a column 'year' holding the year from 'date'.", SALES + "\ndf['date'].dtype → datetime64[ns]",
    ["df['year'] = df['date'].dt.year"],
    ".dt exposes datetime parts: .year, .month, .day_name(), .to_period('M'). It only works on datetime64 columns.");
  Q('map-dict', 'transform', 'medium', "Create 'segment_name' by translating the 'segment' codes with seg_map.", "df['segment'] → ['C', 'B', 'C', …]\nseg_map = {'C': 'Consumer', 'B': 'Business'}",
    ["df['segment_name'] = df['segment'].map(seg_map)", "df['segment_name'] = df['segment'].replace(seg_map)"],
    "Series.map(dict) looks up each value and unmapped values become NaN. replace(dict) leaves unmapped values unchanged.");
  Q('np-where', 'transform', 'medium', "Add 'band': 'high' when salary is over 100000, otherwise 'low'.", EMP + "\nimport numpy as np",
    ["df['band'] = np.where(df['salary'] > 100000, 'high', 'low')", "df['band'] = np.where(df['salary'] <= 100000, 'low', 'high')"],
    "np.where(cond, if_true, if_false) is a vectorised if/else, far faster than apply with a lambda.");
  Q('str-len', 'transform', 'medium', "Add 'name_len': the number of characters in 'name'.", EMP,
    ["df['name_len'] = df['name'].str.len()", "df['name_len'] = df['name'].map(len)", "df['name_len'] = df['name'].apply(len)"],
    "str.len() returns NaN for missing values instead of raising, which map(len) would do.");
  Q('str-slice', 'transform', 'medium', "Add 'code': the first 3 characters of 'product'.", SALES,
    ["df['code'] = df['product'].str[:3]", "df['code'] = df['product'].str.slice(0, 3)", "df['code'] = df['product'].str.slice(stop=3)"],
    ".str[...] slices every string like a Python string; .str[0] gets the first character, .str[-2:] the last two.");
  Q('cumsum', 'transform', 'medium', "Add 'running_total': the cumulative sum of 'revenue' in row order.", SALES_REV,
    ["df['running_total'] = df['revenue'].cumsum()"],
    "cumsum, cumprod, cummax and cummin run down the rows. Sort first if order matters.");
  Q('rank-desc', 'transform', 'medium', "Add 'salary_rank' where the highest salary gets rank 1.", EMP,
    ["df['salary_rank'] = df['salary'].rank(ascending=False)"],
    "Ties share the average rank by default; method='min' or 'dense' gives whole numbers (dense leaves no gaps).",
    [/^df\['salary_rank'\]=df\['salary'\]\.rank\(ascending=False(,method='(dense|min|first|max|average)')?\)$/]);
  Q('concat-str', 'transform', 'medium', "Add 'label' = dept + ' - ' + city, e.g. 'HR - Pune'.", EMP,
    ["df['label'] = df['dept'] + ' - ' + df['city']", "df['label'] = df['dept'].str.cat(df['city'], sep=' - ')"],
    "+ concatenates string columns row by row. Convert numbers first with .astype(str).");
  Q('assign', 'transform', 'medium', "Using assign(), return df with a new column 'tax' = 0.3 × salary.", EMP,
    ["df.assign(tax=df['salary'] * 0.3)", "df.assign(tax=0.3 * df['salary'])", "df.assign(tax=lambda d: d['salary'] * 0.3)"],
    "assign returns a new frame, so it chains. A lambda receives the frame as it is at that point in the chain.",
    [/^df\.assign\(tax=lambda(\w+):(\1\['salary'\]\*0\.3|0\.3\*\1\['salary'\])\)$/]);
  Q('get-dummies', 'transform', 'medium', "One-hot encode 'city' into 0/1 columns across the whole frame, keeping the result in df.", EMP,
    ["df = pd.get_dummies(df, columns=['city'])", "df = pd.get_dummies(df, columns=['city'], dtype=int)"],
    "get_dummies makes one column per category (city_Delhi, …). drop_first=True avoids the redundant column for linear models.");
  Q('sort-multi', 'transform', 'medium', "Sort by dept A→Z, then by salary highest first within each dept.", EMP,
    ["df.sort_values(['dept', 'salary'], ascending=[True, False])", "df.sort_values(by=['dept', 'salary'], ascending=[True, False])"],
    "Pass lists to sort_values: one ascending flag per column, in the same order.");
  Q('cut-bins', 'transform', 'hard', "Add 'age_band': bin 'age' with edges [0, 30, 50, 100] labelled 'young', 'mid', 'senior'.", EMP,
    ["df['age_band'] = pd.cut(df['age'], bins=[0, 30, 50, 100], labels=['young', 'mid', 'senior'])",
     "df['age_band'] = pd.cut(df['age'], [0, 30, 50, 100], labels=['young', 'mid', 'senior'])"],
    "pd.cut bins on fixed edges, right-inclusive: (30, 50]. You need one fewer label than edges. pd.qcut bins on quantiles instead.");
  Q('np-select', 'transform', 'hard', "Add 'size': 'S' when qty < 10, 'M' when qty < 50, otherwise 'L' (use np.select).", SALES + "\nimport numpy as np",
    ["df['size'] = np.select([df['qty'] < 10, df['qty'] < 50], ['S', 'M'], default='L')"],
    "np.select(conditions, choices, default) takes the first condition that's True per row, like CASE WHEN.");
  Q('apply-row', 'transform', 'hard', "Add 'total' = qty × price using apply() over rows.", SALES,
    ["df['total'] = df.apply(lambda r: r['qty'] * r['price'], axis=1)"],
    "apply(axis=1) passes each row as a Series. It's slow (a Python loop); prefer df['qty'] * df['price'] when you can.",
    [/^df\['total'\]=df\.apply\(lambda(\w+):(\1\['qty'\]\*\1\['price'\]|\1\['price'\]\*\1\['qty'\]),axis=1\)$/]);
  Q('email-domain', 'transform', 'hard', "Add 'domain': the part of 'email' after the '@'.", CONTACTS,
    ["df['domain'] = df['email'].str.split('@').str[1]", "df['domain'] = df['email'].str.split('@').str[-1]", "df['domain'] = df['email'].str.split('@').str.get(1)",
     "df['domain'] = df['email'].str.extract(r'@(.+)', expand=False)", "df['domain'] = df['email'].str.extract(r'@(.*)', expand=False)"],
    "str.split returns lists and .str[i] indexes into them. str.extract pulls a regex group; expand=False returns a Series.");
  Q('qcut', 'transform', 'hard', "Add 'quartile': salary split into 4 equal-sized groups labelled 1 to 4.", EMP,
    ["df['quartile'] = pd.qcut(df['salary'], 4, labels=[1, 2, 3, 4])", "df['quartile'] = pd.qcut(df['salary'], q=4, labels=[1, 2, 3, 4])"],
    "qcut makes bins with equal counts (quantiles); cut makes equal widths. duplicates='drop' handles repeated edges.");
  Q('zscore', 'transform', 'hard', "Add 'salary_z': salary standardised to mean 0 and standard deviation 1.", EMP,
    ["df['salary_z'] = (df['salary'] - df['salary'].mean()) / df['salary'].std()"],
    "z = (x − mean) / std. pandas' std() uses ddof=1 (sample std); scikit-learn's StandardScaler uses ddof=0.");
  Q('loc-set', 'transform', 'hard', "Set 'salary' to 0 for every row where dept is 'Intern'.", EMP,
    ["df.loc[df['dept'] == 'Intern', 'salary'] = 0"],
    "Set values with loc[mask, col] = value in one step. df[mask]['salary'] = 0 writes to a copy (SettingWithCopyWarning) and changes nothing.");

  /* ======================= RESHAPE ======================= */
  Q('transpose', 'reshape', 'easy', "Swap the rows and columns of df.", EMP,
    ["df.T", "df.transpose()"],
    "df.T flips the frame. Useful for reading one wide row as a column, e.g. df.head(1).T.");
  Q('sort-index', 'reshape', 'easy', "Sort df by its index.", EMP,
    ["df.sort_index()"],
    "sort_index orders rows by label; axis=1 sorts the columns by name instead. Time-series slicing needs a sorted index.");
  Q('explode', 'reshape', 'medium', "'tags' holds lists like ['a', 'b']. Make one row per tag.", "df.columns → ['id', 'tags']",
    ["df.explode('tags')", "df.explode(column='tags')"],
    "explode repeats the other columns for each list element; empty lists become NaN. ignore_index=True renumbers.");
  Q('pivot', 'reshape', 'medium', "Long df has one row per id and month. Make it wide: one row per id, one column per month.", "df.columns → ['id', 'month', 'sales']",
    ["df.pivot(index='id', columns='month', values='sales')"],
    "pivot only reshapes; it raises if an (id, month) pair repeats. Use pivot_table to aggregate duplicates.");
  Q('stack', 'reshape', 'medium', "Move df's columns into an inner row index level, giving a long Series.", WIDE,
    ["df.stack()"],
    "stack moves columns into the row index (wide → long); unstack does the reverse. melt is the column-based equivalent.");
  Q('unstack', 'reshape', 'medium', "Turn the 'product' level of s into columns.", GROUPED,
    ["s.unstack()", "s.unstack('product')", "s.unstack(level='product')", "s.unstack(level=-1)", "s.unstack(-1)"],
    "unstack moves the innermost index level (or the one you name) into columns. fill_value=0 fills missing combinations.");
  Q('reset-index-series', 'reshape', 'medium', "Turn s into a DataFrame with columns 'region', 'product' and 'revenue'.", GROUPED,
    ["s.reset_index()"],
    "reset_index moves index levels back into columns. The values keep the Series name, here 'revenue'.");
  Q('two-level-index', 'reshape', 'medium', "Make 'region' and 'product' a two-level index.", SALES,
    ["df.set_index(['region', 'product'])"],
    "A list in set_index builds a MultiIndex. Then df.loc[('North', 'Pens')] selects one combination.");
  Q('pivot-table', 'reshape', 'hard', "Total revenue with region as rows and product as columns.", SALES_REV,
    ["df.pivot_table(index='region', columns='product', values='revenue', aggfunc='sum')",
     "pd.pivot_table(df, index='region', columns='product', values='revenue', aggfunc='sum')",
     "df.groupby(['region', 'product'])['revenue'].sum().unstack()"],
    "pivot_table aggregates duplicates, and its default aggfunc is mean, so ask for 'sum'. groupby([...]).sum().unstack() gives the same shape; fill_value=0 fills the gaps.");
  Q('melt', 'reshape', 'hard', "Reshape to long form with columns 'id', 'month', 'sales'.", WIDE,
    ["df.melt(id_vars='id', var_name='month', value_name='sales')", "df.melt(id_vars=['id'], var_name='month', value_name='sales')",
     "pd.melt(df, id_vars='id', var_name='month', value_name='sales')", "pd.melt(df, id_vars=['id'], var_name='month', value_name='sales')"],
    "melt goes wide → long, the inverse of pivot. id_vars stay fixed; the other column names go into var_name and their values into value_name.");
  Q('pivot-multi-agg', 'reshape', 'hard', "Mean and max salary with dept as rows and city as columns, in one pivot_table call.", EMP,
    ["df.pivot_table(index='dept', columns='city', values='salary', aggfunc=['mean', 'max'])"],
    "A list of aggfuncs gives a column MultiIndex: (func, city). Flatten it afterwards if needed.");
  Q('pivot-margins', 'reshape', 'hard', "Total revenue per region (rows) × product (columns), with a grand-total row and column.", SALES_REV,
    ["df.pivot_table(index='region', columns='product', values='revenue', aggfunc='sum', margins=True)"],
    "margins=True adds an 'All' row and column; margins_name= renames it.");
  Q('melt-subset', 'reshape', 'hard', "Melt only the 'jan' and 'feb' columns into long form with columns 'id', 'month', 'sales'.", WIDE,
    ["df.melt(id_vars='id', value_vars=['jan', 'feb'], var_name='month', value_name='sales')",
     "df.melt(id_vars=['id'], value_vars=['jan', 'feb'], var_name='month', value_name='sales')"],
    "value_vars= limits which columns are melted; columns that are in neither id_vars nor value_vars are dropped.");
  Q('crosstab-normalize', 'reshape', 'hard', "For each dept, the share of its employees in each city (each row sums to 1).", EMP,
    ["pd.crosstab(df['dept'], df['city'], normalize='index')"],
    "crosstab counts combinations; normalize='index' makes rows sum to 1, 'columns' makes columns sum to 1, True the whole table.");
  Q('count-fill', 'reshape', 'hard', "Count orders per region (rows) × product (columns), showing 0 for combinations with no orders.", SALES,
    ["pd.crosstab(df['region'], df['product'])", "df.pivot_table(index='region', columns='product', values='order_id', aggfunc='count', fill_value=0)",
     "df.groupby(['region', 'product']).size().unstack(fill_value=0)"],
    "crosstab fills absent combinations with 0 for you. With pivot_table or unstack, pass fill_value=0.");
  Q('flatten-cols', 'reshape', 'hard', "df has MultiIndex columns like ('salary', 'mean'). Flatten them to names like 'salary_mean'.", "df.columns → MultiIndex([('salary', 'mean'), ('salary', 'max'), …])",
    ["df.columns = ['_'.join(c) for c in df.columns]", "df.columns = df.columns.map('_'.join)"],
    "Each MultiIndex column is a tuple; '_'.join(tuple) glues its parts. Named aggregation avoids MultiIndex columns in the first place.",
    [/^df\['columns'\]=\['_'\.join\((\w+)\)for\1indf\['columns'\]\]$/]);

  /* ======================= COMBINE ======================= */
  Q('concat-side', 'combine', 'easy', "Put df1 and df2 side by side as columns, aligned on the index.", "df1.index.equals(df2.index) → True",
    ["pd.concat([df1, df2], axis=1)"],
    "axis=1 joins columns on the index. Rows with an index in only one frame get NaN in the other's columns.");
  Q('concat-list', 'combine', 'easy', "Stack every frame in the list frames into one, with a fresh index.", "frames = [df_jan, df_feb, df_mar]   # same columns",
    ["pd.concat(frames, ignore_index=True)", "pd.concat(frames, axis=0, ignore_index=True)"],
    "Collect frames in a list and concat once at the end; concatenating inside a loop copies the data every time.");
  Q('merge-left', 'combine', 'medium', "Left-join customers onto orders by 'cust_id'.", ORD_CUST,
    ["orders.merge(customers, on='cust_id', how='left')", "pd.merge(orders, customers, on='cust_id', how='left')"],
    "how='left' keeps every order, even one with no matching customer (NaN-filled). validate='m:1' guards against accidental row blow-up; indicator=True shows where each row matched.");
  Q('concat', 'combine', 'medium', "Stack df1 on top of df2 with a fresh 0…n-1 index.", "df1.columns.equals(df2.columns) → True",
    ["pd.concat([df1, df2], ignore_index=True)", "pd.concat([df1, df2], axis=0, ignore_index=True)"],
    "pd.concat takes a list. ignore_index=True renumbers the rows; axis=1 places frames side by side instead.");
  Q('merge-inner', 'combine', 'medium', "Inner-join orders and customers on 'cust_id'.", ORD_CUST,
    ["orders.merge(customers, on='cust_id')", "orders.merge(customers, on='cust_id', how='inner')", "pd.merge(orders, customers, on='cust_id')", "pd.merge(orders, customers, on='cust_id', how='inner')"],
    "merge defaults to how='inner': only keys present in both frames survive. Check row counts before and after.");
  Q('merge-suffixes', 'combine', 'medium', "Merge a and b on 'id'; give the clashing 'score' columns the suffixes '_a' and '_b'.", AB,
    ["a.merge(b, on='id', suffixes=('_a', '_b'))", "pd.merge(a, b, on='id', suffixes=('_a', '_b'))"],
    "Without suffixes=, clashing columns become score_x and score_y.");
  Q('concat-keys', 'combine', 'medium', "Stack df_2024 and df_2025, labelling their rows with an outer index level '2024' / '2025'.", "df_2024.columns.equals(df_2025.columns) → True",
    ["pd.concat([df_2024, df_2025], keys=['2024', '2025'])"],
    "keys= records where each row came from. reset_index(level=0) turns that label into a column.");
  Q('merge-multi-key', 'combine', 'medium', "Left-join targets onto sales, matching on both 'region' and 'month'.", "sales.columns   → ['region', 'month', 'revenue']\ntargets.columns → ['region', 'month', 'target']",
    ["sales.merge(targets, on=['region', 'month'], how='left')", "pd.merge(sales, targets, on=['region', 'month'], how='left')"],
    "on=[...] matches on every listed column together, like a composite key.");
  Q('cross-join', 'combine', 'medium', "Get every combination of rows from sizes and colors.", "sizes.columns  → ['size']\ncolors.columns → ['color']",
    ["sizes.merge(colors, how='cross')", "pd.merge(sizes, colors, how='cross')"],
    "how='cross' is a Cartesian product: len(a) × len(b) rows. Handy for building every combination of a grid.");
  Q('append-row', 'combine', 'medium', "Add the one-row DataFrame new_row to the bottom of df with a fresh index, keeping the result in df.", EMP + "\nnew_row → DataFrame with the same columns, 1 row",
    ["df = pd.concat([df, new_row], ignore_index=True)"],
    "DataFrame.append was removed in pandas 2.0; use pd.concat. Appending row by row in a loop is slow, so collect rows first.");
  Q('merge-left-right-on', 'combine', 'hard', "Left-join customers onto orders, where orders.cust_id matches customers.id.", "orders.columns    → ['order_id', 'cust_id', 'qty']\ncustomers.columns → ['id', 'name', 'segment']",
    ["orders.merge(customers, left_on='cust_id', right_on='id', how='left')", "pd.merge(orders, customers, left_on='cust_id', right_on='id', how='left')"],
    "left_on / right_on join on differently named keys; both key columns are kept, so drop one afterwards.");
  Q('anti-join', 'combine', 'hard', "Get the orders whose cust_id doesn't appear in customers.", ORD_CUST,
    ["orders[~orders['cust_id'].isin(customers['cust_id'])]", "orders.loc[~orders['cust_id'].isin(customers['cust_id'])]"],
    "An anti-join keeps left rows with no match. ~isin is the quickest; or merge with indicator=True and keep the 'left_only' rows.");
  Q('outer-indicator', 'combine', 'hard', "Full outer join of a and b on 'id', with a column showing which side each row came from.", AB,
    ["a.merge(b, on='id', how='outer', indicator=True)", "pd.merge(a, b, on='id', how='outer', indicator=True)"],
    "indicator=True adds _merge with 'left_only', 'right_only' or 'both'. Great for reconciling two lists.");
  Q('merge-validate', 'combine', 'hard', "Left-join customers onto orders on 'cust_id', raising an error if customers has duplicate cust_ids.", ORD_CUST,
    ["orders.merge(customers, on='cust_id', how='left', validate='many_to_one')", "orders.merge(customers, on='cust_id', how='left', validate='m:1')",
     "pd.merge(orders, customers, on='cust_id', how='left', validate='many_to_one')", "pd.merge(orders, customers, on='cust_id', how='left', validate='m:1')"],
    "validate= asserts the key relationship (1:1, 1:m, m:1). It catches duplicate keys that would silently multiply rows.");
  Q('merge-asof', 'combine', 'hard', "For each trade, attach the latest quote at or before its time. Both frames are sorted by 'time'.", "trades.columns → ['time', 'qty']\nquotes.columns → ['time', 'price']",
    ["pd.merge_asof(trades, quotes, on='time')"],
    "merge_asof is a nearest-key join; direction='backward' (the default) takes the last key at or before. by= matches within groups, e.g. per ticker.");
  Q('combine-first', 'combine', 'hard', "Fill the missing values in a with the values from b at the same index and column.", "a and b share the same index and columns; a has gaps",
    ["a.combine_first(b)", "a.fillna(b)"],
    "combine_first patches a's NaN values from b and also adds any rows and columns that only b has.");

  /* ======================= AGGREGATE ======================= */
  Q('col-sum', 'aggregate', 'easy', "Get the total of 'revenue'.", SALES_REV,
    ["df['revenue'].sum()"],
    "Aggregations skip NaN by default (skipna=True). df.sum(numeric_only=True) totals every numeric column.");
  Q('col-mean', 'aggregate', 'easy', "Get the average age.", EMP,
    ["df['age'].mean()"],
    "mean skips NaN. Compare it with median(); a big gap means skewed data or outliers.");
  Q('col-max', 'aggregate', 'easy', "Get the highest salary.", EMP,
    ["df['salary'].max()"],
    "max gives the value; idxmax gives the label of the row that has it.");
  Q('groupby-sum', 'aggregate', 'easy', "Get the total revenue per region.", SALES_REV,
    ["df.groupby('region')['revenue'].sum()", "df.groupby('region')['revenue'].agg('sum')"],
    "groupby(key)[col].sum() returns a Series indexed by the key. as_index=False keeps the key as a column.");
  Q('groupby-mean', 'aggregate', 'medium', "Average salary for each dept.", EMP,
    ["df.groupby('dept')['salary'].mean()", "df.groupby('dept')['salary'].agg('mean')", "df.groupby('dept').agg({'salary': 'mean'})"],
    "Split-apply-combine: groupby(key)[col].agg_fn(). Selecting the column before .mean() avoids averaging every numeric column.");
  Q('orders-per-cust', 'aggregate', 'medium', "Number of orders per customer.", SALES,
    ["df.groupby('cust_id').size()", "df['cust_id'].value_counts()", "df.groupby('cust_id')['order_id'].count()", "df.groupby('cust_id')['order_id'].nunique()"],
    "size() counts rows including NaN; count() counts non-missing values of a column.");
  Q('multi-stat', 'aggregate', 'medium', "Min, max and mean salary per dept, in one call.", EMP,
    ["df.groupby('dept')['salary'].agg(['min', 'max', 'mean'])"],
    "agg([list]) gives one column per function. Use named aggregation to choose the output names.");
  Q('groupby-nunique', 'aggregate', 'medium', "Number of distinct products each customer bought.", SALES,
    ["df.groupby('cust_id')['product'].nunique()"],
    "nunique counts distinct values per group, like SQL COUNT(DISTINCT product).");
  Q('groupby-two-keys', 'aggregate', 'medium', "Total revenue per region and product.", SALES_REV,
    ["df.groupby(['region', 'product'])['revenue'].sum()"],
    "A list of keys gives a MultiIndex result; .unstack() turns the inner key into columns.");
  Q('groupby-sorted', 'aggregate', 'medium', "Total revenue per region, highest first.", SALES_REV,
    ["df.groupby('region')['revenue'].sum().sort_values(ascending=False)"],
    "groupby sorts by the key; chain sort_values to sort by the result. .head(n) then gives the top n.");
  Q('groupby-as-index', 'aggregate', 'medium', "Mean salary per dept as a DataFrame with 'dept' as an ordinary column, not the index.", EMP,
    ["df.groupby('dept', as_index=False)['salary'].mean()", "df.groupby('dept')['salary'].mean().reset_index()"],
    "as_index=False (or reset_index()) keeps the group key as a column, ready to merge or plot.");
  Q('earliest-date', 'aggregate', 'medium', "Earliest order date for each customer.", SALES_REV,
    ["df.groupby('cust_id')['date'].min()", "df.groupby('cust_id')['date'].agg('min')"],
    "min and max work on datetimes. first() is the first non-null value in row order, which isn't the earliest unless you sort.");
  Q('agg-dict', 'aggregate', 'medium', "Total qty and mean price per product, in one agg call using a dict.", SALES,
    ["df.groupby('product').agg({'qty': 'sum', 'price': 'mean'})", "df.groupby('product').agg({'price': 'mean', 'qty': 'sum'})"],
    "agg({col: func}) applies a different function to each column; a list of functions per column is allowed too.");
  Q('mode', 'aggregate', 'medium', "Get the most common city, as a single value.", EMP,
    ["df['city'].mode()[0]", "df['city'].value_counts().idxmax()", "df['city'].value_counts().index[0]", "df['city'].mode().iloc[0]"],
    "mode() returns a Series because there can be ties, so take [0]. value_counts().idxmax() is equivalent.");
  Q('count-condition', 'aggregate', 'medium', "How many employees earn over 100000?", EMP,
    ["(df['salary'] > 100000).sum()", "len(df[df['salary'] > 100000])", "df['salary'].gt(100000).sum()"],
    "True counts as 1, so summing a mask counts matches; mean() of a mask gives the share.");
  Q('named-agg', 'aggregate', 'hard', "Per dept, in one call: columns 'avg_salary' (mean salary) and 'headcount' (number of employees).", EMP,
    ["df.groupby('dept').agg(avg_salary=('salary', 'mean'), headcount=('name', 'count'))"],
    "Named aggregation, new_col=(source_col, func), gives clean flat column names, so there's no MultiIndex to tidy up afterwards.",
    [/^df\.groupby\('dept'\)\.agg\(avg_salary=\('salary','mean'\),headcount=\('\w+','(count|size|nunique)'\)\)$/]);
  Q('transform', 'aggregate', 'hard', "Add 'dept_avg': each row's department mean salary (same length as df).", EMP,
    ["df['dept_avg'] = df.groupby('dept')['salary'].transform('mean')"],
    "transform returns a result aligned to the original rows (agg collapses to one row per group). It's ideal for group-relative features like salary − dept_avg.");
  Q('rank-within', 'aggregate', 'hard', "Add a column 'rank' ranking salary within each dept, highest salary = 1.", EMP,
    ["df['rank'] = df.groupby('dept')['salary'].rank(ascending=False)"],
    "groupby().rank() keeps the original index, so it assigns straight back as a column, like SQL RANK() OVER (PARTITION BY dept ORDER BY salary DESC). method='dense' avoids gaps on ties.",
    [/^df\['rank'\]=df\.groupby\('dept'\)\['salary'\]\.rank\(ascending=False(,method='(dense|min|first|max|average)')?\)$/]);
  Q('groupby-filter', 'aggregate', 'hard', "Keep only the rows from depts with more than 10 employees.", EMP,
    ["df.groupby('dept').filter(lambda g: len(g) > 10)", "df[df.groupby('dept')['dept'].transform('size') > 10]", "df[df.groupby('dept')['name'].transform('count') > 10]"],
    "groupby().filter(func) keeps or drops whole groups. The transform('size') mask version is faster on many groups.",
    [/^df\.groupby\('dept'\)\.filter\(lambda(\w+):len\(\1\)>10\)$/]);
  Q('groupby-cumsum', 'aggregate', 'hard', "Add 'cum_rev': a running total of revenue within each customer, in row order.", SALES_REV,
    ["df['cum_rev'] = df.groupby('cust_id')['revenue'].cumsum()"],
    "Cumulative functions on a groupby restart for each group and keep the original index, so they assign straight back.");
  Q('top-n-per-group', 'aggregate', 'hard', "Get the rows of the 2 highest salaries in each dept.", EMP,
    ["df.sort_values('salary', ascending=False).groupby('dept').head(2)", "df.sort_values(by='salary', ascending=False).groupby('dept').head(2)"],
    "Sort once, then groupby().head(n) takes the first n rows of each group. It keeps all columns, unlike nlargest on a groupby.");
  Q('share-of-group', 'aggregate', 'hard', "Add 'share': each row's revenue as a fraction of its region's total revenue.", SALES_REV,
    ["df['share'] = df['revenue'] / df.groupby('region')['revenue'].transform('sum')"],
    "transform('sum') puts the group total on every row, so the division lines up row by row.");
  Q('weighted-avg', 'aggregate', 'hard', "Get the revenue-weighted average of price across all rows.", "df.columns → ['product', 'price', 'revenue']\nimport numpy as np",
    ["np.average(df['price'], weights=df['revenue'])", "(df['price'] * df['revenue']).sum() / df['revenue'].sum()"],
    "Weighted mean = Σ(x·w) / Σw. np.average does it in one call.");
  Q('groupby-shift', 'aggregate', 'hard', "Rows are sorted by date. Add 'prev_amount': each customer's previous order amount.", "df.columns → ['cust_id', 'date', 'amount']",
    ["df['prev_amount'] = df.groupby('cust_id')['amount'].shift(1)", "df['prev_amount'] = df.groupby('cust_id')['amount'].shift()"],
    "groupby().shift() lags within each group, so values never leak across customers. Each customer's first row is NaN.");

  /* ======================= TIME SERIES ======================= */
  Q('dt-month', 'time-series', 'easy', "Add 'month' (1 to 12) taken from 'date'.", TS,
    ["df['month'] = df['date'].dt.month"],
    ".dt.month is 1–12; .dt.month_name() gives 'March'. Convert with pd.to_datetime first if .dt raises.");
  Q('day-name', 'time-series', 'easy', "Add 'weekday' holding day names like 'Monday'.", TS,
    ["df['weekday'] = df['date'].dt.day_name()"],
    "day_name() is a method (needs parentheses); .dt.dayofweek gives 0 = Monday … 6 = Sunday.");
  Q('date-filter', 'time-series', 'easy', "Keep rows dated on or after 1 Jan 2024.", TS,
    ["df[df['date'] >= '2024-01-01']", "df.loc[df['date'] >= '2024-01-01']", `df.query("date >= '2024-01-01'")`],
    "Datetime columns compare directly with date strings; pandas parses the string for you.");
  Q('weekend', 'time-series', 'medium', "Add 'is_weekend': True on Saturdays and Sundays.", TS,
    ["df['is_weekend'] = df['date'].dt.dayofweek >= 5", "df['is_weekend'] = df['date'].dt.dayofweek > 4", "df['is_weekend'] = df['date'].dt.weekday >= 5", "df['is_weekend'] = df['date'].dt.dayofweek.isin([5, 6])"],
    "dayofweek runs from Monday = 0 to Sunday = 6, so the weekend is 5 and 6.");
  Q('to-period', 'time-series', 'medium', "Add 'ym' holding each date's month as a period, like 2024-03.", TS,
    ["df['ym'] = df['date'].dt.to_period('M')"],
    "to_period('M') labels the month (also 'Q', 'Y', 'W'); grouping by it keeps different years apart.");
  Q('date-diff', 'time-series', 'medium', "Add 'days_to_ship': the whole days between 'ordered' and 'shipped'.", "df.columns → ['order_id', 'ordered', 'shipped']   both datetime64",
    ["df['days_to_ship'] = (df['shipped'] - df['ordered']).dt.days"],
    "Subtracting datetimes gives a Timedelta; .dt.days takes whole days and .dt.total_seconds() the exact duration.");
  Q('date-between', 'time-series', 'medium', "Keep rows from Q1 2024, 1 Jan to 31 Mar inclusive.", TS,
    ["df[df['date'].between('2024-01-01', '2024-03-31')]", "df[(df['date'] >= '2024-01-01') & (df['date'] <= '2024-03-31')]", "df.loc[df['date'].between('2024-01-01', '2024-03-31')]"],
    "between includes both ends. With times in the data, '2024-03-31' means midnight, so use < '2024-04-01' to include that whole day.");
  Q('resample-weekly', 'time-series', 'medium', "Get the total sales per week.", TSI,
    ["df['sales'].resample('W').sum()", "df.resample('W')['sales'].sum()", "df.resample('W').sum()"],
    "resample needs a DatetimeIndex (or on='col'). 'W' weeks end on Sunday; 'W-MON' ends them on Monday.");
  Q('pct-change', 'time-series', 'medium', "Add 'growth': the day-over-day percentage change in 'sales'.", TS,
    ["df['growth'] = df['sales'].pct_change()", "df['growth'] = df['sales'].pct_change(1)", "df['growth'] = df['sales'].pct_change(periods=1)"],
    "pct_change() = x / previous − 1, as a fraction (0.1 means +10%). The first row is NaN.");
  Q('shift', 'time-series', 'medium', "Add 'prev_sales': the previous day's sales.", TS,
    ["df['prev_sales'] = df['sales'].shift(1)", "df['prev_sales'] = df['sales'].shift()", "df['prev_sales'] = df['sales'].shift(periods=1)"],
    "shift(1) lags values down one row; shift(-1) looks one row ahead. These are the building blocks of lag features.");
  Q('diff', 'time-series', 'medium', "Add 'change': today's sales minus yesterday's.", TS,
    ["df['change'] = df['sales'].diff()", "df['change'] = df['sales'].diff(1)", "df['change'] = df['sales'] - df['sales'].shift(1)", "df['change'] = df['sales'] - df['sales'].shift()"],
    "diff(n) = x − x shifted by n rows; diff(7) compares with the same weekday last week.");
  Q('date-range', 'time-series', 'medium', "Create every daily date from 2024-01-01 to 2024-01-31.", IMPORTS,
    ["pd.date_range('2024-01-01', '2024-01-31')", "pd.date_range(start='2024-01-01', end='2024-01-31')", "pd.date_range('2024-01-01', '2024-01-31', freq='D')",
     "pd.date_range(start='2024-01-01', end='2024-01-31', freq='D')", "pd.date_range('2024-01-01', periods=31)", "pd.date_range(start='2024-01-01', periods=31)"],
    "date_range takes start plus end or periods, and freq ('D', 'W', 'MS', 'h'…). Useful for reindexing to fill missing dates.");
  Q('rolling', 'time-series', 'medium', "7-day rolling mean of 'sales'.", "df: one row per day, sorted by 'date'; columns → ['date', 'sales']",
    ["df['sales'].rolling(7).mean()", "df['sales'].rolling(window=7).mean()"],
    "rolling(n) builds a moving window over the previous n rows. The first n−1 results are NaN unless you pass min_periods=.");
  Q('resample-month', 'time-series', 'hard', "Total revenue per calendar month (df has one row per order).", SALES_REV,
    ["df.resample('ME', on='date')['revenue'].sum()", "df.resample('M', on='date')['revenue'].sum()",
     "df.set_index('date').resample('ME')['revenue'].sum()", "df.set_index('date').resample('M')['revenue'].sum()",
     "df.groupby(pd.Grouper(key='date', freq='ME'))['revenue'].sum()", "df.groupby(pd.Grouper(key='date', freq='M'))['revenue'].sum()",
     "df.groupby(df['date'].dt.to_period('M'))['revenue'].sum()"],
    "resample is groupby for time. It needs a DatetimeIndex or on='date'. 'ME' means month-end in pandas ≥ 2.2 ('M' before). dt.to_period('M') groups by month label.");
  Q('resample-ms', 'time-series', 'hard', "Get the monthly mean of sales, labelled with each month's first day.", TSI,
    ["df['sales'].resample('MS').mean()", "df.resample('MS')['sales'].mean()", "df.resample('MS').mean()"],
    "'MS' labels by month start and 'ME' by month end. The aggregation is the same; only the labels differ.");
  Q('rolling-30d', 'time-series', 'hard', "Get the rolling sum of sales over the last 30 calendar days (time-based window).", TSI,
    ["df['sales'].rolling('30D').sum()", "df['sales'].rolling(window='30D').sum()"],
    "An offset window like '30D' counts calendar time, so missing days don't stretch it. It needs a sorted DatetimeIndex (or on=).");
  Q('ewm', 'time-series', 'hard', "Get the exponentially weighted mean of sales with a span of 7.", TS,
    ["df['sales'].ewm(span=7).mean()"],
    "ewm weights recent rows more heavily; span, halflife or alpha set the decay. It's smoother and faster to react than a plain rolling mean.");
  Q('asfreq-fill', 'time-series', 'hard', "Some days are missing. Make one row per calendar day, with sales = 0 on the missing days.", TSI,
    ["df.asfreq('D', fill_value=0)", "df.resample('D').sum()", "df.asfreq(freq='D', fill_value=0)"],
    "asfreq('D') inserts the missing dates (NaN by default); fill_value fills them. The empty days of resample('D').sum() also come out as 0.");
  Q('yoy', 'time-series', 'hard', "Monthly data, one row per month. Get the year-over-year % change in sales.", "df.index → DatetimeIndex, one row per month, sorted\ndf.columns → ['sales']",
    ["df['sales'].pct_change(12)", "df['sales'].pct_change(periods=12)"],
    "periods=12 compares each month with the same month a year earlier; the first 12 results are NaN.");

  /* ======================= EXPORT ======================= */
  Q('to-csv', 'export', 'easy', "Save df to 'clean.csv' without writing the index.", EMP,
    ["df.to_csv('clean.csv', index=False)"],
    "to_csv writes the index as an unnamed first column by default. index=False avoids the 'Unnamed: 0' column when you reload.");
  Q('to-excel', 'export', 'easy', "Save df to 'out.xlsx' without the index.", EMP,
    ["df.to_excel('out.xlsx', index=False)"],
    "to_excel needs openpyxl. sheet_name= names the sheet ('Sheet1' by default).");
  Q('to-parquet', 'export', 'easy', "Save df to 'out.parquet'.", EMP,
    ["df.to_parquet('out.parquet')", "df.to_parquet('out.parquet', index=False)"],
    "Parquet keeps dtypes (dates, categories) and compresses well; it's the best format for passing data between pandas jobs.");
  Q('to-list', 'export', 'easy', "Turn the 'name' column into a Python list.", EMP,
    ["df['name'].tolist()", "df['name'].to_list()", "list(df['name'])"],
    "tolist() converts NumPy scalars to plain Python types too, which helps when serialising to JSON.");
  Q('to-numpy', 'export', 'easy', "Get the values of df as a NumPy array.", "df.columns → ['x1', 'x2', 'x3']   all numeric",
    ["df.to_numpy()", "df.values"],
    "to_numpy() is preferred over .values; pass dtype= to force a type. scikit-learn accepts DataFrames directly anyway.");
  Q('to-json-records', 'export', 'medium', "Save df to 'out.json' as a JSON array with one object per row.", EMP,
    ["df.to_json('out.json', orient='records')"],
    "orient='records' writes [{col: value}, …]; add lines=True for JSON Lines. Dates become epoch milliseconds unless date_format='iso'.");
  Q('to-dict-records', 'export', 'medium', "Convert df into a list of dicts, one per row.", EMP,
    ["df.to_dict('records')", "df.to_dict(orient='records')"],
    "The default orient ('dict') gives {column: {index: value}}; 'records' is the row-wise form most APIs want.");
  Q('to-csv-cols', 'export', 'medium', "Save only the 'name' and 'salary' columns to 'out.csv', without the index.", EMP,
    ["df[['name', 'salary']].to_csv('out.csv', index=False)", "df.to_csv('out.csv', columns=['name', 'salary'], index=False)"],
    "Select columns first, or pass columns= to to_csv; both write only those columns, in that order.");
  Q('to-tsv', 'export', 'medium', "Save df to 'out.tsv' as tab-separated values, without the index.", EMP,
    ["df.to_csv('out.tsv', sep='\\t', index=False)"],
    "to_csv writes any delimiter through sep=. A .gz file name compresses the output automatically.");
  Q('excel-writer', 'export', 'hard', "To write df1 and df2 to two sheets of 'out.xlsx', write the with-statement line that opens the writer as writer.", "then: df1.to_excel(writer, sheet_name='a'); df2.to_excel(writer, sheet_name='b')",
    ["with pd.ExcelWriter('out.xlsx') as writer:", "with pd.ExcelWriter('out.xlsx') as writer"],
    "ExcelWriter keeps one file open for several to_excel calls; the with block saves and closes it. mode='a' appends sheets to an existing file.");
  Q('to-sql', 'export', 'hard', "Write df to the table 'orders' through conn, replacing the table if it exists, without the index.", "import sqlite3\nconn = sqlite3.connect('shop.db')",
    ["df.to_sql('orders', conn, if_exists='replace', index=False)", "df.to_sql(name='orders', con=conn, if_exists='replace', index=False)"],
    "if_exists='fail' (the default), 'replace' or 'append'. chunksize= batches large inserts.");

  window.PANDAS_BANK = B;
})();
