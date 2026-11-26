/* Python Rapid Fire question bank, loaded by python-rapid-fire-quiz.html.

   Each entry: { id, stage, difficulty, kind, q, code, accept, learn, acceptRegex? }
   - stage and difficulty are internal: they drive sampling and the timer and are never shown.
   - kind 'out': "What does this print?" The learner types the output. Several printed lines are typed
     separated by spaces; if the code raises, the answer is the exception name (e.g. KeyError).
   - kind 'code': the learner writes one line of Python, graded against accept.
   - accept: every reasonable correct form; accept[0] is the canonical one and is shown as "the" answer.
   - acceptRegex: optional regex strings tested against the *normalised* code answer (no spaces outside
     strings, ' quotes, keyword arguments sorted). Use them for answers with free variable names.
   Run `python3 tools/check_python_bank.py` after editing: it executes every snippet and checks accept[0].
   Keep the mix at about 25% easy / 50% medium / 25% hard (see AGENTS.md). */
window.PYTHON_BANK = [
 {
  "id": "floor-mod",
  "stage": "types",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(7 // 2, 7 % 2)",
  "accept": [
   "3 1"
  ],
  "learn": "// is floor division and % the remainder: a == (a // b) * b + a % b."
 },
 {
  "id": "true-div",
  "stage": "types",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(10 / 5)",
  "accept": [
   "2.0"
  ],
  "learn": "/ always returns a float in Python 3, even when it divides exactly. Use // for an int."
 },
 {
  "id": "truthy-str",
  "stage": "types",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(bool(''), bool(' '))",
  "accept": [
   "False True"
  ],
  "learn": "Only the empty string is falsy; a string holding a space is non-empty, so it's truthy."
 },
 {
  "id": "neg-floor",
  "stage": "types",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(-7 // 2)",
  "accept": [
   "-4"
  ],
  "learn": "// floors towards negative infinity, so -3.5 becomes -4 (not -3 as in C or Java)."
 },
 {
  "id": "bool-int",
  "stage": "types",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(True + True)",
  "accept": [
   "2"
  ],
  "learn": "bool is a subclass of int: True == 1 and False == 0, so they add like numbers."
 },
 {
  "id": "float-eq",
  "stage": "types",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(0.1 + 0.2 == 0.3)",
  "accept": [
   "False"
  ],
  "learn": "Binary floats can't represent 0.1 exactly. Compare with math.isclose(a, b) instead of ==."
 },
 {
  "id": "int-base",
  "stage": "types",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(int('101', 2))",
  "accept": [
   "5"
  ],
  "learn": "int(text, base) parses in any base from 2 to 36; bin(), oct() and hex() go the other way."
 },
 {
  "id": "pow-assoc",
  "stage": "types",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(2 ** 3 ** 2)",
  "accept": [
   "512"
  ],
  "learn": "** is right-associative: 2 ** 3 ** 2 is 2 ** (3 ** 2) = 2 ** 9."
 },
 {
  "id": "divmod",
  "stage": "types",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(divmod(17, 5))",
  "accept": [
   "(3, 2)"
  ],
  "learn": "divmod(a, b) returns the tuple (a // b, a % b) in one call."
 },
 {
  "id": "round-bankers",
  "stage": "types",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(round(2.5), round(3.5))",
  "accept": [
   "2 4"
  ],
  "learn": "round() uses banker's rounding: halves go to the nearest even number."
 },
 {
  "id": "nan-eq",
  "stage": "types",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "x = float('nan')\nprint(x == x)",
  "accept": [
   "False"
  ],
  "learn": "NaN is not equal to anything, itself included. Test with math.isnan(x)."
 },
 {
  "id": "isinstance-bool",
  "stage": "types",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(isinstance(True, int), type(True) == int)",
  "accept": [
   "True False"
  ],
  "learn": "isinstance respects inheritance (bool subclasses int); comparing type() checks the exact class only."
 },
 {
  "id": "str-to-int",
  "stage": "types",
  "difficulty": "easy",
  "kind": "code",
  "q": "Convert the string s to an integer called n.",
  "code": "s = '42'",
  "accept": [
   "n = int(s)"
  ],
  "learn": "int() parses a numeric string; it raises ValueError for text like '4.2' or 'abc'."
 },
 {
  "id": "slice-mid",
  "stage": "strings",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "s = 'python'\nprint(s[1:4])",
  "accept": [
   "yth"
  ],
  "learn": "s[start:stop] includes start and stops before stop: indices 1, 2, 3."
 },
 {
  "id": "str-repeat",
  "stage": "strings",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print('ab' * 3)",
  "accept": [
   "ababab"
  ],
  "learn": "Multiplying a string (or list) by an int repeats it."
 },
 {
  "id": "strip-concat",
  "stage": "strings",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print('  hi  '.strip() + '!')",
  "accept": [
   "hi!"
  ],
  "learn": "strip() removes surrounding whitespace; lstrip()/rstrip() do one side only."
 },
 {
  "id": "reverse-str",
  "stage": "strings",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "s = 'python'\nprint(s[::-1])",
  "accept": [
   "nohtyp"
  ],
  "learn": "A step of -1 walks the sequence backwards: s[::-1] is the reversed copy."
 },
 {
  "id": "split-empty",
  "stage": "strings",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print('a,b,,c'.split(','))",
  "accept": [
   "['a', 'b', '', 'c']"
  ],
  "learn": "split(sep) keeps empty fields between adjacent separators; split() with no argument drops them."
 },
 {
  "id": "join",
  "stage": "strings",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print('-'.join(['x', 'y', 'z']))",
  "accept": [
   "x-y-z"
  ],
  "learn": "sep.join(iterable) is called on the separator, and every item must already be a str."
 },
 {
  "id": "find-count",
  "stage": "strings",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "s = 'hello'\nprint(s.find('z'), s.count('l'))",
  "accept": [
   "-1 2"
  ],
  "learn": "find() returns -1 when missing (index() raises ValueError instead); count() counts non-overlapping hits."
 },
 {
  "id": "str-immutable",
  "stage": "strings",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "s = 'abc'\ns[0] = 'z'\nprint(s)",
  "accept": [
   "TypeError"
  ],
  "learn": "Strings are immutable. Build a new one: s = 'z' + s[1:]."
 },
 {
  "id": "fstring-2dp",
  "stage": "strings",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "pi = 3.14159\nprint(f'{pi:.2f}')",
  "accept": [
   "3.14"
  ],
  "learn": "The format spec after : controls output; .2f means fixed-point with 2 decimals."
 },
 {
  "id": "sorted-str",
  "stage": "strings",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(sorted('bca'))",
  "accept": [
   "['a', 'b', 'c']"
  ],
  "learn": "sorted() takes any iterable and always returns a list; use ''.join(sorted(s)) to get a string back."
 },
 {
  "id": "fstring-comma",
  "stage": "strings",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(f'{1234567:,}')",
  "accept": [
   "1,234,567"
  ],
  "learn": "The , format option adds thousands separators; combine it as f'{x:,.2f}'."
 },
 {
  "id": "replace-count",
  "stage": "strings",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print('banana'.replace('a', 'o', 2))",
  "accept": [
   "bonona"
  ],
  "learn": "replace(old, new, count) replaces only the first count occurrences."
 },
 {
  "id": "str-compare-case",
  "stage": "strings",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print('a' < 'B')",
  "accept": [
   "False"
  ],
  "learn": "Strings compare by code point and every uppercase letter (A=65) comes before every lowercase one (a=97)."
 },
 {
  "id": "split-words",
  "stage": "strings",
  "difficulty": "medium",
  "kind": "code",
  "q": "Make words, the list of words in the sentence s.",
  "code": "s = 'the quick  brown fox'",
  "accept": [
   "words = s.split()"
  ],
  "learn": "split() with no argument splits on any run of whitespace and drops empty strings; split(' ') would not."
 },
 {
  "id": "startswith",
  "stage": "strings",
  "difficulty": "medium",
  "kind": "code",
  "q": "Write an expression that is True when the string url starts with 'http'.",
  "code": "url = 'https://example.com'",
  "accept": [
   "url.startswith('http')",
   "url[:4] == 'http'"
  ],
  "learn": "startswith/endswith also accept a tuple: url.startswith(('http', 'ftp'))."
 },
 {
  "id": "append-len",
  "stage": "lists",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [1, 2, 3]\na.append(4)\nprint(len(a))",
  "accept": [
   "4"
  ],
  "learn": "append() adds one item to the end, in place."
 },
 {
  "id": "neg-index",
  "stage": "lists",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [10, 20, 30, 40]\nprint(a[-1], a[1:3])",
  "accept": [
   "40 [20, 30]"
  ],
  "learn": "Negative indices count from the end; slices return a new list and exclude the stop index."
 },
 {
  "id": "list-concat",
  "stage": "lists",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([1, 2] + [3])",
  "accept": [
   "[1, 2, 3]"
  ],
  "learn": "+ joins two lists into a new list; both operands must be lists."
 },
 {
  "id": "alias",
  "stage": "lists",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
  "accept": [
   "[1, 2, 3, 4]"
  ],
  "learn": "Assignment never copies: a and b name the same list. Copy with a.copy() or a[:]."
 },
 {
  "id": "sort-none",
  "stage": "lists",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [3, 1, 2]\nprint(a.sort())",
  "accept": [
   "None"
  ],
  "learn": "list.sort() sorts in place and returns None; sorted(a) returns a new sorted list."
 },
 {
  "id": "extend-insert",
  "stage": "lists",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [1, 2]\na.extend([3, 4])\na.insert(0, 0)\nprint(a)",
  "accept": [
   "[0, 1, 2, 3, 4]"
  ],
  "learn": "extend() adds each item of an iterable; insert(i, x) puts x before index i."
 },
 {
  "id": "step-slice",
  "stage": "lists",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [1, 2, 3, 4, 5]\nprint(a[::2])",
  "accept": [
   "[1, 3, 5]"
  ],
  "learn": "The third slice number is the step: a[::2] takes every second item from the start."
 },
 {
  "id": "pop-index",
  "stage": "lists",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [5, 3, 8]\na.pop()\nprint(a, a.index(3))",
  "accept": [
   "[5, 3] 1"
  ],
  "learn": "pop() removes and returns the last item (pop(i) a given one); index(x) finds the first position of x."
 },
 {
  "id": "append-vs-extend",
  "stage": "lists",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [1, 2]\na.append([3, 4])\nprint(len(a))",
  "accept": [
   "3"
  ],
  "learn": "append() adds its argument as one item, even a list; extend() would add 3 and 4 separately."
 },
 {
  "id": "grid-alias",
  "stage": "lists",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [[0] * 2] * 2\na[0][0] = 1\nprint(a)",
  "accept": [
   "[[1, 0], [1, 0]]"
  ],
  "learn": "[[0] * 2] * 2 repeats a reference to one inner list. Build rows with [[0] * 2 for _ in range(2)]."
 },
 {
  "id": "remove-while-iter",
  "stage": "lists",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [1, 2, 3, 4]\nfor x in a:\n    a.remove(x)\nprint(a)",
  "accept": [
   "[2, 4]"
  ],
  "learn": "Removing while iterating shifts items under the loop's index, so every other one is skipped. Loop over a copy: for x in a[:]."
 },
 {
  "id": "slice-assign",
  "stage": "lists",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "a = [1, 2, 3, 4]\na[1:3] = ['x']\nprint(a)",
  "accept": [
   "[1, 'x', 4]"
  ],
  "learn": "Assigning to a slice replaces that whole range, and the new list can be a different length."
 },
 {
  "id": "reverse-inplace",
  "stage": "lists",
  "difficulty": "easy",
  "kind": "code",
  "q": "Reverse the list a in place.",
  "code": "a = [1, 2, 3]",
  "accept": [
   "a.reverse()",
   "a[:] = a[::-1]"
  ],
  "learn": "reverse() mutates and returns None; a[::-1] or reversed(a) give a reversed copy or iterator instead."
 },
 {
  "id": "shallow-copy",
  "stage": "lists",
  "difficulty": "medium",
  "kind": "code",
  "q": "Make b, a shallow copy of the list a.",
  "code": "a = [1, 2, 3]",
  "accept": [
   "b = a.copy()",
   "b = a[:]",
   "b = list(a)",
   "b = copy.copy(a)"
  ],
  "learn": "A shallow copy is a new list holding the same items; nested lists still need copy.deepcopy()."
 },
 {
  "id": "tuple-index",
  "stage": "tuples-sets",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "t = (1, 2, 3)\nprint(t[1])",
  "accept": [
   "2"
  ],
  "learn": "Tuples index and slice exactly like lists; they just can't be changed."
 },
 {
  "id": "set-dedupe",
  "stage": "tuples-sets",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(len({1, 2, 2, 3}))",
  "accept": [
   "3"
  ],
  "learn": "A set keeps one copy of each value, so duplicates disappear."
 },
 {
  "id": "not-a-tuple",
  "stage": "tuples-sets",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "t = (5)\nprint(type(t).__name__)",
  "accept": [
   "int"
  ],
  "learn": "Parentheses alone don't make a tuple; the comma does. A one-item tuple is (5,)."
 },
 {
  "id": "star-unpack",
  "stage": "tuples-sets",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "first, *rest = [1, 2, 3, 4]\nprint(rest)",
  "accept": [
   "[2, 3, 4]"
  ],
  "learn": "A starred name in an unpacking collects the leftover items into a list."
 },
 {
  "id": "set-intersect",
  "stage": "tuples-sets",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print({1, 2, 3} & {2, 3, 4})",
  "accept": [
   "{2, 3}"
  ],
  "learn": "& is intersection, | union, - difference and ^ symmetric difference."
 },
 {
  "id": "swap",
  "stage": "tuples-sets",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "x, y = 1, 2\nx, y = y, x\nprint(x, y)",
  "accept": [
   "2 1"
  ],
  "learn": "The right side is packed into a tuple first, so swapping needs no temp variable."
 },
 {
  "id": "tuple-immutable",
  "stage": "tuples-sets",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "t = (1, 2)\nt[0] = 9\nprint(t)",
  "accept": [
   "TypeError"
  ],
  "learn": "Tuples don't support item assignment. Build a new tuple, e.g. (9,) + t[1:]."
 },
 {
  "id": "set-subset-xor",
  "stage": "tuples-sets",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print({1, 2} < {1, 2, 3}, {1, 2} ^ {2, 3})",
  "accept": [
   "True {1, 3}"
  ],
  "learn": "< on sets tests proper subset; ^ keeps values in exactly one of the two sets."
 },
 {
  "id": "tuple-mutable-item",
  "stage": "tuples-sets",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "t = ([1], 2)\nt[0].append(3)\nprint(t)",
  "accept": [
   "([1, 3], 2)"
  ],
  "learn": "A tuple can't rebind its slots, but a mutable object inside it can still change."
 },
 {
  "id": "empty-set",
  "stage": "tuples-sets",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(set('aab') == {'a', 'b'}, {} == set())",
  "accept": [
   "True False"
  ],
  "learn": "{} is an empty dict, not a set. The only way to write an empty set is set()."
 },
 {
  "id": "set-unhashable",
  "stage": "tuples-sets",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "s = {[1, 2]}\nprint(s)",
  "accept": [
   "TypeError"
  ],
  "learn": "Set items and dict keys must be hashable. Lists aren't; use a tuple (1, 2) instead."
 },
 {
  "id": "unique-sorted",
  "stage": "tuples-sets",
  "difficulty": "medium",
  "kind": "code",
  "q": "Make u, the unique values of the list a as a sorted list.",
  "code": "a = [3, 1, 3, 2, 1]",
  "accept": [
   "u = sorted(set(a))",
   "u = sorted(list(set(a)))"
  ],
  "learn": "set() removes duplicates but has no order; sorted() turns it back into an ordered list."
 },
 {
  "id": "dict-add",
  "stage": "dicts",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {'a': 1}\nd['b'] = 2\nprint(len(d))",
  "accept": [
   "2"
  ],
  "learn": "Assigning to a new key adds it; len(d) counts keys."
 },
 {
  "id": "dict-get",
  "stage": "dicts",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {'a': 1}\nprint(d.get('z', 0))",
  "accept": [
   "0"
  ],
  "learn": "get(key, default) returns the default instead of raising when the key is missing."
 },
 {
  "id": "dict-keyerror",
  "stage": "dicts",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {'a': 1}\nprint(d['z'])",
  "accept": [
   "KeyError"
  ],
  "learn": "Square-bracket lookup raises KeyError for a missing key. Use get(), in, or a defaultdict."
 },
 {
  "id": "dict-items",
  "stage": "dicts",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {'x': 1, 'y': 2}\nprint(list(d.items()))",
  "accept": [
   "[('x', 1), ('y', 2)]"
  ],
  "learn": "items() yields (key, value) tuples, in insertion order (guaranteed since Python 3.7)."
 },
 {
  "id": "dict-invert",
  "stage": "dicts",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {'a': 1, 'b': 2}\nprint({v: k for k, v in d.items()})",
  "accept": [
   "{1: 'a', 2: 'b'}"
  ],
  "learn": "A dict comprehension swaps keys and values; duplicate values would collapse to the last key."
 },
 {
  "id": "dict-update",
  "stage": "dicts",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {'a': 1}\nd.update({'a': 5, 'b': 2})\nprint(d)",
  "accept": [
   "{'a': 5, 'b': 2}"
  ],
  "learn": "update() overwrites existing keys and adds new ones, in place."
 },
 {
  "id": "setdefault",
  "stage": "dicts",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {}\nd.setdefault('k', []).append(1)\nprint(d)",
  "accept": [
   "{'k': [1]}"
  ],
  "learn": "setdefault(key, default) inserts the default only if the key is missing, then returns the stored value."
 },
 {
  "id": "dict-key-equal",
  "stage": "dicts",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {1: 'a', 1.0: 'b', True: 'c'}\nprint(d)",
  "accept": [
   "{1: 'c'}"
  ],
  "learn": "1, 1.0 and True are equal and hash alike, so they're one key: the first key object stays and the last value wins."
 },
 {
  "id": "counter",
  "stage": "dicts",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "from collections import Counter\nprint(Counter('banana').most_common(1))",
  "accept": [
   "[('a', 3)]"
  ],
  "learn": "Counter counts hashable items; most_common(n) returns the n (item, count) pairs with the highest counts."
 },
 {
  "id": "dict-mutate-iter",
  "stage": "dicts",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "d = {'a': 1, 'b': 2}\nfor k in d:\n    d[k + 'x'] = 0\nprint(d)",
  "accept": [
   "RuntimeError"
  ],
  "learn": "Adding or removing keys while iterating a dict raises RuntimeError. Loop over list(d) instead."
 },
 {
  "id": "defaultdict",
  "stage": "dicts",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "from collections import defaultdict\nd = defaultdict(int)\nfor ch in 'abca':\n    d[ch] += 1\nprint(d['a'], d['z'], len(d))",
  "accept": [
   "2 0 4"
  ],
  "learn": "defaultdict calls its factory for a missing key and stores the result, so even reading d['z'] adds a key."
 },
 {
  "id": "merge-dicts",
  "stage": "dicts",
  "difficulty": "medium",
  "kind": "code",
  "q": "Make c, a new dict merging a and b, where b's values win on clashes.",
  "code": "a = {'x': 1, 'y': 2}\nb = {'y': 9}",
  "accept": [
   "c = {**a, **b}",
   "c = a | b",
   "c = dict(a, **b)"
  ],
  "learn": "{**a, **b} unpacks both, later keys win. Python 3.9+ also has a | b (and a |= b in place)."
 },
 {
  "id": "key-in",
  "stage": "dicts",
  "difficulty": "easy",
  "kind": "code",
  "q": "Write an expression that is True when the key 'k' is in the dict d.",
  "code": "d = {'k': 1}",
  "accept": [
   "'k' in d",
   "'k' in d.keys()"
  ],
  "learn": "in on a dict checks keys in constant time; checking values needs v in d.values()."
 },
 {
  "id": "range-loop",
  "stage": "control",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "for i in range(3):\n    print(i)",
  "accept": [
   "0 1 2"
  ],
  "learn": "range(n) runs 0 to n-1, so the loop runs n times."
 },
 {
  "id": "ternary",
  "stage": "control",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "x = 5\nprint('big' if x > 3 else 'small')",
  "accept": [
   "big"
  ],
  "learn": "A if cond else B is Python's conditional expression."
 },
 {
  "id": "range-step",
  "stage": "control",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(list(range(2, 10, 3)))",
  "accept": [
   "[2, 5, 8]"
  ],
  "learn": "range(start, stop, step) stops before stop; the step can be negative to count down."
 },
 {
  "id": "for-else",
  "stage": "control",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "for i in range(5):\n    if i == 2:\n        break\nelse:\n    print('no break')\nprint(i)",
  "accept": [
   "2"
  ],
  "learn": "A loop's else runs only when the loop finishes without break. The loop variable keeps its last value."
 },
 {
  "id": "while-step",
  "stage": "control",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "i = 0\nwhile i < 10:\n    i += 3\nprint(i)",
  "accept": [
   "12"
  ],
  "learn": "The condition is checked before each pass: 9 < 10 lets one more += 3 run."
 },
 {
  "id": "and-or-values",
  "stage": "control",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(0 or 'a', 1 and 'b')",
  "accept": [
   "a b"
  ],
  "learn": "or returns the first truthy operand (else the last); and returns the first falsy one (else the last)."
 },
 {
  "id": "or-none",
  "stage": "control",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([] or None)",
  "accept": [
   "None"
  ],
  "learn": "If every operand is falsy, or returns the last one."
 },
 {
  "id": "continue-sum",
  "stage": "control",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "n = 0\nfor i in range(5):\n    if i % 2:\n        continue\n    n += i\nprint(n)",
  "accept": [
   "6"
  ],
  "learn": "continue skips the rest of this pass; here only 0, 2 and 4 are added."
 },
 {
  "id": "short-circuit",
  "stage": "control",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "x = 0\nprint(x == 0 or 1 / x > 1)",
  "accept": [
   "True"
  ],
  "learn": "or stops at the first truthy operand, so 1 / x never runs and no ZeroDivisionError is raised."
 },
 {
  "id": "nested-break",
  "stage": "control",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "total = 0\nfor i in range(3):\n    for j in range(3):\n        if j == i:\n            break\n        total += 1\nprint(total)",
  "accept": [
   "3"
  ],
  "learn": "break leaves only the innermost loop; the outer loop carries on with the next i."
 },
 {
  "id": "chained-compare",
  "stage": "control",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(1 < 2 < 3, 3 > 2 > 2)",
  "accept": [
   "True False"
  ],
  "learn": "a < b < c means a < b and b < c; 3 > 2 > 2 fails on 2 > 2."
 },
 {
  "id": "walrus",
  "stage": "control",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "data = [1, 2, 3, 4]\nif (n := len(data)) > 3:\n    print(n * 2)",
  "accept": [
   "8"
  ],
  "learn": "The walrus operator := assigns and returns a value inside an expression (Python 3.8+)."
 },
 {
  "id": "enumerate-loop",
  "stage": "control",
  "difficulty": "medium",
  "kind": "code",
  "q": "Write the for-loop header that walks the list items with i as the index and x as the item.",
  "code": "items = ['a', 'b', 'c']",
  "accept": [
   "for i, x in enumerate(items):",
   "for (i, x) in enumerate(items):"
  ],
  "learn": "enumerate(iterable, start=0) yields (index, item) pairs, so there's no need for range(len(items))."
 },
 {
  "id": "default-arg",
  "stage": "functions",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(x, y=2):\n    return x * y\nprint(f(3))",
  "accept": [
   "6"
  ],
  "learn": "Parameters with defaults can be left out; here y takes 2."
 },
 {
  "id": "implicit-none",
  "stage": "functions",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f():\n    pass\nprint(f())",
  "accept": [
   "None"
  ],
  "learn": "A function without a return statement returns None."
 },
 {
  "id": "star-args",
  "stage": "functions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(*args):\n    return len(args)\nprint(f(1, 2, 3))",
  "accept": [
   "3"
  ],
  "learn": "*args gathers extra positional arguments into a tuple."
 },
 {
  "id": "kwargs",
  "stage": "functions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(**kw):\n    return sorted(kw)\nprint(f(b=1, a=2))",
  "accept": [
   "['a', 'b']"
  ],
  "learn": "**kw gathers keyword arguments into a dict; iterating (or sorting) a dict uses its keys."
 },
 {
  "id": "map-lambda",
  "stage": "functions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "sq = lambda x: x ** 2\nprint(list(map(sq, [1, 2, 3])))",
  "accept": [
   "[1, 4, 9]"
  ],
  "learn": "map() applies a function to every item lazily; wrap it in list() to see the results."
 },
 {
  "id": "keyword-call",
  "stage": "functions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(a, b):\n    return a - b\nprint(f(b=1, a=5))",
  "accept": [
   "4"
  ],
  "learn": "Keyword arguments match by name, so their order in the call doesn't matter."
 },
 {
  "id": "mutate-arg",
  "stage": "functions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(x):\n    x.append(1)\na = []\nf(a)\nf(a)\nprint(a)",
  "accept": [
   "[1, 1]"
  ],
  "learn": "Arguments are passed by object reference: mutating a list inside a function changes the caller's list."
 },
 {
  "id": "rebind-arg",
  "stage": "functions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(x):\n    x = [9]\na = [1]\nf(a)\nprint(a)",
  "accept": [
   "[1]"
  ],
  "learn": "Rebinding a parameter only changes the local name; the caller's object is untouched."
 },
 {
  "id": "mutable-default",
  "stage": "functions",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(a, L=[]):\n    L.append(a)\n    return L\nf(1)\nprint(f(2))",
  "accept": [
   "[1, 2]"
  ],
  "learn": "Defaults are evaluated once, when def runs, so a list default is shared between calls. Use L=None and create the list inside."
 },
 {
  "id": "kw-only",
  "stage": "functions",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(a, *, b):\n    return a + b\nprint(f(1, 2))",
  "accept": [
   "TypeError"
  ],
  "learn": "Parameters after a bare * are keyword-only: f(1, b=2) works, f(1, 2) doesn't."
 },
 {
  "id": "lambda-star",
  "stage": "functions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print((lambda *a: a)(1, 2))",
  "accept": [
   "(1, 2)"
  ],
  "learn": "Lambdas take the same parameter forms as def, *args included, and *args is always a tuple."
 },
 {
  "id": "unpack-call",
  "stage": "functions",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f(a, b, c):\n    return a + b * c\nargs = [1, 2]\nprint(f(*args, c=10))",
  "accept": [
   "21"
  ],
  "learn": "*iterable spreads items into positional arguments and **dict into keyword arguments at the call site."
 },
 {
  "id": "lambda-square",
  "stage": "functions",
  "difficulty": "medium",
  "kind": "code",
  "q": "Write a lambda named square that returns its argument squared.",
  "code": "",
  "accept": [
   "square = lambda x: x ** 2",
   "square = lambda x: x * x"
  ],
  "learn": "lambda args: expression makes a small anonymous function; PEP 8 prefers def when you name it.",
  "acceptRegex": [
   "^square=lambda(\\w+):(\\1\\*\\*2|\\1\\*\\1)$"
  ]
 },
 {
  "id": "sort-by-len",
  "stage": "functions",
  "difficulty": "hard",
  "kind": "code",
  "q": "Sort the list words in place by length, longest first.",
  "code": "words = ['kiwi', 'fig', 'banana']",
  "accept": [
   "words.sort(key=len, reverse=True)",
   "words.sort(key=lambda w: len(w), reverse=True)",
   "words.sort(key=lambda w: -len(w))"
  ],
  "learn": "key= takes a function applied to each item before comparing; reverse=True flips the order. Python's sort is stable.",
  "acceptRegex": [
   "^words\\.sort\\(key=lambda(\\w+):len\\(\\1\\),reverse=True\\)$",
   "^words\\.sort\\(key=lambda(\\w+):-len\\(\\1\\)\\)$"
  ]
 },
 {
  "id": "listcomp",
  "stage": "comprehensions",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([x * 2 for x in range(3)])",
  "accept": [
   "[0, 2, 4]"
  ],
  "learn": "[expr for x in iterable] builds a list by evaluating expr for each item."
 },
 {
  "id": "listcomp-filter",
  "stage": "comprehensions",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([x for x in range(6) if x % 2 == 0])",
  "accept": [
   "[0, 2, 4]"
  ],
  "learn": "A trailing if keeps only the items where the condition is true."
 },
 {
  "id": "setcomp",
  "stage": "comprehensions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print({x % 3 for x in range(6)})",
  "accept": [
   "{0, 1, 2}"
  ],
  "learn": "Curly braces with a single expression make a set comprehension, so duplicates collapse."
 },
 {
  "id": "nested-for-comp",
  "stage": "comprehensions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([(x, y) for x in 'ab' for y in range(2)])",
  "accept": [
   "[('a', 0), ('a', 1), ('b', 0), ('b', 1)]"
  ],
  "learn": "Multiple for clauses nest left to right, like nested loops with the first one outermost."
 },
 {
  "id": "comp-ifelse",
  "stage": "comprehensions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([x if x > 0 else 0 for x in [-1, 2, -3]])",
  "accept": [
   "[0, 2, 0]"
  ],
  "learn": "if/else before the for transforms every item; a lone if after the for filters items out."
 },
 {
  "id": "dictcomp",
  "stage": "comprehensions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print({w: len(w) for w in ['hi', 'hey']})",
  "accept": [
   "{'hi': 2, 'hey': 3}"
  ],
  "learn": "{k: v for ...} builds a dict; later duplicate keys overwrite earlier ones."
 },
 {
  "id": "genexp-sum",
  "stage": "comprehensions",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(sum(x for x in range(5)))",
  "accept": [
   "10"
  ],
  "learn": "A generator expression inside a call needs no extra parentheses and never builds a list in memory."
 },
 {
  "id": "flatten",
  "stage": "comprehensions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "m = [[1, 2], [3, 4]]\nprint([x for row in m for x in row])",
  "accept": [
   "[1, 2, 3, 4]"
  ],
  "learn": "To flatten, write the for clauses in loop order: outer (row) first, then inner (x)."
 },
 {
  "id": "comp-matrix",
  "stage": "comprehensions",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([[r * c for c in range(3)] for r in range(2)])",
  "accept": [
   "[[0, 0, 0], [0, 1, 2]]"
  ],
  "learn": "A comprehension inside another builds one inner list per outer item: here one row per r."
 },
 {
  "id": "comp-two-filters",
  "stage": "comprehensions",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([x for x in range(20) if x % 2 if x % 3 == 0])",
  "accept": [
   "[3, 9, 15]"
  ],
  "learn": "Several if clauses are ANDed: odd and divisible by 3."
 },
 {
  "id": "comp-walrus",
  "stage": "comprehensions",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([y for x in [1, 2, 3] if (y := x * 10) > 15])",
  "accept": [
   "[20, 30]"
  ],
  "learn": "The walrus operator lets a comprehension compute a value once, then both filter on it and keep it."
 },
 {
  "id": "evens-comp",
  "stage": "comprehensions",
  "difficulty": "medium",
  "kind": "code",
  "q": "Using a comprehension, make evens: the even numbers in nums, in order.",
  "code": "nums = [1, 2, 3, 4, 6]",
  "accept": [
   "evens = [n for n in nums if n % 2 == 0]"
  ],
  "learn": "[x for x in seq if cond] filters; it reads like the for loop it replaces.",
  "acceptRegex": [
   "^evens=\\[(\\w+)for\\1innumsif(\\1%2==0|not\\1%2|\\1%2<1)\\]$"
  ]
 },
 {
  "id": "transpose",
  "stage": "comprehensions",
  "difficulty": "hard",
  "kind": "code",
  "q": "In one line, make t: the transpose of the list of lists m, as a list of tuples.",
  "code": "m = [[1, 2, 3], [4, 5, 6]]",
  "accept": [
   "t = list(zip(*m))"
  ],
  "learn": "zip(*m) passes each row as a separate argument, so zip pairs up the columns."
 },
 {
  "id": "local-shadow",
  "stage": "scope",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "x = 10\ndef f():\n    x = 5\nf()\nprint(x)",
  "accept": [
   "10"
  ],
  "learn": "Assigning inside a function creates a local name; the global x is untouched."
 },
 {
  "id": "read-global",
  "stage": "scope",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f():\n    return y\ny = 3\nprint(f())",
  "accept": [
   "3"
  ],
  "learn": "Names are looked up when the function runs, so y only needs to exist by the time f() is called."
 },
 {
  "id": "global-kw",
  "stage": "scope",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "x = 1\ndef f():\n    global x\n    x = 2\nf()\nprint(x)",
  "accept": [
   "2"
  ],
  "learn": "global x makes assignments inside the function rebind the module-level name."
 },
 {
  "id": "unbound-local",
  "stage": "scope",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "x = 0\ndef f():\n    print(x)\n    x = 1\nf()",
  "accept": [
   "UnboundLocalError"
  ],
  "learn": "Any assignment to x anywhere in a function makes x local for the whole body, so reading it first fails."
 },
 {
  "id": "nonlocal-counter",
  "stage": "scope",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def outer():\n    n = 0\n    def inner():\n        nonlocal n\n        n += 1\n        return n\n    return inner\nc = outer()\nc()\nprint(c())",
  "accept": [
   "2"
  ],
  "learn": "A closure keeps its enclosing variables alive between calls; nonlocal lets it rebind them."
 },
 {
  "id": "closure-factory",
  "stage": "scope",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def make(k):\n    return lambda x: x * k\ntriple = make(3)\nprint(triple(4))",
  "accept": [
   "12"
  ],
  "learn": "The returned lambda closes over k, which stays available after make() returns."
 },
 {
  "id": "loop-var-leaks",
  "stage": "scope",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "for i in range(3):\n    pass\nprint(i)",
  "accept": [
   "2"
  ],
  "learn": "for loops don't have their own scope: the loop variable survives with its last value."
 },
 {
  "id": "late-binding",
  "stage": "scope",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "fs = [lambda: i for i in range(3)]\nprint([f() for f in fs])",
  "accept": [
   "[2, 2, 2]"
  ],
  "learn": "Closures look a variable up when called, not when defined. Bind it now with a default: lambda i=i: i."
 },
 {
  "id": "enclosing-lookup",
  "stage": "scope",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "x = 'g'\ndef f():\n    x = 'l'\n    def g():\n        return x\n    return g()\nprint(f(), x)",
  "accept": [
   "l g"
  ],
  "learn": "Lookup follows LEGB: Local, then Enclosing function, then Global, then Built-in."
 },
 {
  "id": "comp-scope",
  "stage": "scope",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "i = 9\nsquares = [i * i for i in range(3)]\nprint(i)",
  "accept": [
   "9"
  ],
  "learn": "A comprehension has its own scope, so its loop variable doesn't overwrite the outer i (unlike a for loop)."
 },
 {
  "id": "shadow-builtin",
  "stage": "scope",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "list = [1, 2]\nprint(list((3, 4)))",
  "accept": [
   "TypeError"
  ],
  "learn": "Naming a variable list shadows the built-in, so list(...) now tries to call your list object."
 },
 {
  "id": "nonlocal-stmt",
  "stage": "scope",
  "difficulty": "hard",
  "kind": "code",
  "q": "Inside a nested function, write the statement that lets it rebind count, a variable of the enclosing function.",
  "code": "def outer():\n    count = 0\n    def bump():\n        ...  # this line\n        count += 1",
  "accept": [
   "nonlocal count"
  ],
  "learn": "nonlocal targets the nearest enclosing function's variable; global targets the module level."
 },
 {
  "id": "class-attr",
  "stage": "oop",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "class A:\n    x = 1\nprint(A().x)",
  "accept": [
   "1"
  ],
  "learn": "An instance falls back to class attributes when it has no attribute of that name itself."
 },
 {
  "id": "init",
  "stage": "oop",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "class P:\n    def __init__(self, n):\n        self.n = n\nprint(P(4).n)",
  "accept": [
   "4"
  ],
  "learn": "__init__ runs on creation; self.n = n stores the value on that instance."
 },
 {
  "id": "inherit",
  "stage": "oop",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "class A:\n    def hi(self):\n        return 'A'\nclass B(A):\n    pass\nprint(B().hi())",
  "accept": [
   "A"
  ],
  "learn": "A subclass inherits every method it doesn't override."
 },
 {
  "id": "dunder-str",
  "stage": "oop",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "class A:\n    def __str__(self):\n        return 'an A'\nprint(A())",
  "accept": [
   "an A"
  ],
  "learn": "print() calls str(), which uses __str__; __repr__ is the fallback and what containers show."
 },
 {
  "id": "class-counter",
  "stage": "oop",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "class C:\n    count = 0\n    def __init__(self):\n        C.count += 1\nC()\nC()\nprint(C.count)",
  "accept": [
   "2"
  ],
  "learn": "Updating C.count changes the one class attribute every instance shares."
 },
 {
  "id": "super",
  "stage": "oop",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "class A:\n    def f(self):\n        return 'A'\nclass B(A):\n    def f(self):\n        return 'B' + super().f()\nprint(B().f())",
  "accept": [
   "BA"
  ],
  "learn": "super() calls the parent's version of a method, so an override can extend it instead of replacing it."
 },
 {
  "id": "isinstance-object",
  "stage": "oop",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "class A:\n    pass\na = A()\nprint(isinstance(a, object), type(a).__name__)",
  "accept": [
   "True A"
  ],
  "learn": "Every class ultimately inherits from object."
 },
 {
  "id": "instance-shadows",
  "stage": "oop",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "class A:\n    x = 1\na, b = A(), A()\na.x = 5\nprint(a.x, b.x, A.x)",
  "accept": [
   "5 1 1"
  ],
  "learn": "Assigning via an instance creates an instance attribute that hides the class attribute for that instance only."
 },
 {
  "id": "missing-self",
  "stage": "oop",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "class A:\n    def hi():\n        return 'hi'\nprint(A().hi())",
  "accept": [
   "TypeError"
  ],
  "learn": "Calling a method passes the instance as the first argument, so a method without self gets one argument too many."
 },
 {
  "id": "shared-list-attr",
  "stage": "oop",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "class D:\n    items = []\n    def add(self, x):\n        self.items.append(x)\na, b = D(), D()\na.add(1)\nprint(b.items)",
  "accept": [
   "[1]"
  ],
  "learn": "A mutable class attribute is shared by every instance. Create per-instance lists in __init__."
 },
 {
  "id": "eq-vs-is",
  "stage": "oop",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "class V:\n    def __init__(self, x):\n        self.x = x\n    def __eq__(self, o):\n        return self.x == o.x\nprint(V(1) == V(1), V(1) is V(1))",
  "accept": [
   "True False"
  ],
  "learn": "== calls __eq__ (value equality); is checks identity, and two separate objects are never identical."
 },
 {
  "id": "mro",
  "stage": "oop",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "class A:\n    def who(self): return 'A'\nclass B(A):\n    def who(self): return 'B'\nclass C(A):\n    def who(self): return 'C'\nclass D(B, C):\n    pass\nprint(D().who(), [k.__name__ for k in D.__mro__])",
  "accept": [
   "B ['D', 'B', 'C', 'A', 'object']"
  ],
  "learn": "The MRO (C3 linearisation) searches D, then bases left to right, with shared bases last."
 },
 {
  "id": "property-readonly",
  "stage": "oop",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "class T:\n    def __init__(self):\n        self._c = 0\n    @property\n    def c(self):\n        return self._c\nt = T()\nt.c = 5\nprint(t.c)",
  "accept": [
   "AttributeError"
  ],
  "learn": "A property without a setter is read-only. Add @c.setter to allow assignment."
 },
 {
  "id": "subclass-header",
  "stage": "oop",
  "difficulty": "medium",
  "kind": "code",
  "q": "Write the first line of a class Dog that inherits from Animal.",
  "code": "class Animal:\n    ...",
  "accept": [
   "class Dog(Animal):"
  ],
  "learn": "Bases go in parentheses after the class name; several bases are separated by commas."
 },
 {
  "id": "zip-short",
  "stage": "iterators",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(list(zip([1, 2, 3], 'ab')))",
  "accept": [
   "[(1, 'a'), (2, 'b')]"
  ],
  "learn": "zip stops at the shortest input; itertools.zip_longest pads instead."
 },
 {
  "id": "enumerate-start",
  "stage": "iterators",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(list(enumerate('ab', start=1)))",
  "accept": [
   "[(1, 'a'), (2, 'b')]"
  ],
  "learn": "enumerate(iterable, start=1) numbers items from 1."
 },
 {
  "id": "sorted-reverse",
  "stage": "iterators",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(sorted([3, 1, 2], reverse=True))",
  "accept": [
   "[3, 2, 1]"
  ],
  "learn": "sorted() returns a new list and leaves the original alone; reverse=True sorts descending."
 },
 {
  "id": "next-iter",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "it = iter([1, 2, 3])\nnext(it)\nprint(list(it))",
  "accept": [
   "[2, 3]"
  ],
  "learn": "An iterator remembers its position; items it has already produced are gone."
 },
 {
  "id": "yield",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def g():\n    yield 1\n    yield 2\nprint(list(g()))",
  "accept": [
   "[1, 2]"
  ],
  "learn": "A function with yield returns a generator, which runs up to the next yield each time it's asked for a value."
 },
 {
  "id": "gen-exhausted",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "g = (x * x for x in range(3))\nprint(list(g), list(g))",
  "accept": [
   "[0, 1, 4] []"
  ],
  "learn": "A generator can be consumed only once; the second pass finds it empty."
 },
 {
  "id": "any-all",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(any([0, '', 3]), all([]))",
  "accept": [
   "True True"
  ],
  "learn": "any() is True if one item is truthy; all() of an empty iterable is True (no counter-example)."
 },
 {
  "id": "map-method",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(list(map(str.upper, ['a', 'b'])))",
  "accept": [
   "['A', 'B']"
  ],
  "learn": "map() accepts any callable, including an unbound method like str.upper."
 },
 {
  "id": "filter-none",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(list(filter(None, [0, 1, '', 'a', None])))",
  "accept": [
   "[1, 'a']"
  ],
  "learn": "filter(None, it) keeps only the truthy items."
 },
 {
  "id": "gen-lazy",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def g():\n    print('start')\n    yield 1\ngen = g()\nprint('made')",
  "accept": [
   "made"
  ],
  "learn": "Calling a generator function runs none of its body until the first next()."
 },
 {
  "id": "stopiteration",
  "stage": "iterators",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "it = iter([1])\nnext(it)\nnext(it)",
  "accept": [
   "StopIteration"
  ],
  "learn": "next() on an exhausted iterator raises StopIteration; next(it, default) returns the default instead."
 },
 {
  "id": "islice-count",
  "stage": "iterators",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "from itertools import islice, count\nprint(list(islice(count(5, 2), 3)))",
  "accept": [
   "[5, 7, 9]"
  ],
  "learn": "count(start, step) is infinite; islice takes a finite slice of any iterator."
 },
 {
  "id": "yield-from",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def gen():\n    yield from [1, 2]\n    yield 3\nprint(list(gen()))",
  "accept": [
   "[1, 2, 3]"
  ],
  "learn": "yield from delegates to another iterable, yielding each of its items in turn."
 },
 {
  "id": "unzip",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "pairs = [(1, 'a'), (2, 'b')]\nprint(list(zip(*pairs)))",
  "accept": [
   "[(1, 2), ('a', 'b')]"
  ],
  "learn": "zip(*pairs) unzips: it regroups the first items together and the second items together."
 },
 {
  "id": "in-consumes",
  "stage": "iterators",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "it = iter([1, 2, 3, 4])\nprint(3 in it, list(it))",
  "accept": [
   "True [4]"
  ],
  "learn": "in on an iterator consumes items until it finds a match, so they're gone afterwards."
 },
 {
  "id": "next-default",
  "stage": "iterators",
  "difficulty": "medium",
  "kind": "code",
  "q": "Make first: the next item of the iterator it, or None if it's empty.",
  "code": "it = iter([])",
  "accept": [
   "first = next(it, None)"
  ],
  "learn": "The second argument to next() is returned instead of raising StopIteration."
 },
 {
  "id": "valueerror",
  "stage": "errors",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(int('abc'))",
  "accept": [
   "ValueError"
  ],
  "learn": "ValueError means the type is right but the value isn't usable, like a non-numeric string for int()."
 },
 {
  "id": "indexerror",
  "stage": "errors",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print([1, 2][5])",
  "accept": [
   "IndexError"
  ],
  "learn": "Indexing past the end raises IndexError; slicing past the end just returns fewer items."
 },
 {
  "id": "zerodiv",
  "stage": "errors",
  "difficulty": "easy",
  "kind": "out",
  "q": "What does this print?",
  "code": "print(1 / 0)",
  "accept": [
   "ZeroDivisionError"
  ],
  "learn": "Dividing by zero raises ZeroDivisionError for /, // and %."
 },
 {
  "id": "try-finally",
  "stage": "errors",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "try:\n    1 / 0\nexcept ZeroDivisionError:\n    print('a')\nfinally:\n    print('b')",
  "accept": [
   "a b"
  ],
  "learn": "finally always runs, whether or not an exception was raised or handled."
 },
 {
  "id": "try-else",
  "stage": "errors",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "try:\n    x = 1\nexcept Exception:\n    print('err')\nelse:\n    print('ok')",
  "accept": [
   "ok"
  ],
  "learn": "else runs only when the try block raised nothing; it's the place for code that shouldn't be guarded."
 },
 {
  "id": "typeerror-concat",
  "stage": "errors",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "print('2' + 2)",
  "accept": [
   "TypeError"
  ],
  "learn": "Python doesn't coerce str and int. Use '2' + str(2) or int('2') + 2."
 },
 {
  "id": "attributeerror",
  "stage": "errors",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "x = None\nprint(x.upper())",
  "accept": [
   "AttributeError"
  ],
  "learn": "Calling a method that doesn't exist on the object (often None) raises AttributeError."
 },
 {
  "id": "finally-return",
  "stage": "errors",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f():\n    try:\n        return 1\n    finally:\n        print('cleanup')\nprint(f())",
  "accept": [
   "cleanup 1"
  ],
  "learn": "finally runs before the function actually returns, so 'cleanup' prints before the caller prints 1."
 },
 {
  "id": "except-as",
  "stage": "errors",
  "difficulty": "medium",
  "kind": "out",
  "q": "What does this print?",
  "code": "try:\n    raise ValueError('bad')\nexcept Exception as e:\n    print(type(e).__name__, e)",
  "accept": [
   "ValueError bad"
  ],
  "learn": "except Base catches subclasses too; str(e) is the message passed when it was raised."
 },
 {
  "id": "finally-overrides",
  "stage": "errors",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "def f():\n    try:\n        return 'try'\n    finally:\n        return 'finally'\nprint(f())",
  "accept": [
   "finally"
  ],
  "learn": "A return in finally overrides the try's return (and swallows any exception). Avoid it."
 },
 {
  "id": "except-order",
  "stage": "errors",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "try:\n    {}['k']\nexcept LookupError:\n    print('lookup')\nexcept KeyError:\n    print('key')",
  "accept": [
   "lookup"
  ],
  "learn": "except clauses are tried top to bottom; KeyError is a subclass of LookupError, so the first clause wins. Put specific ones first."
 },
 {
  "id": "raise-from",
  "stage": "errors",
  "difficulty": "hard",
  "kind": "out",
  "q": "What does this print?",
  "code": "try:\n    try:\n        1 / 0\n    except ZeroDivisionError as e:\n        raise ValueError('wrapped') from e\nexcept ValueError as v:\n    print(type(v.__cause__).__name__)",
  "accept": [
   "ZeroDivisionError"
  ],
  "learn": "raise X from e chains exceptions: the original is kept in X.__cause__ and shown in the traceback."
 },
 {
  "id": "except-multi",
  "stage": "errors",
  "difficulty": "medium",
  "kind": "code",
  "q": "Write the except line that catches either ValueError or TypeError, binding it to e.",
  "code": "try:\n    risky()\n...  # this line",
  "accept": [
   "except (ValueError, TypeError) as e:",
   "except (TypeError, ValueError) as e:"
  ],
  "learn": "Group exception classes in a tuple to handle them with one clause."
 },
 {
  "id": "raise-msg",
  "stage": "errors",
  "difficulty": "hard",
  "kind": "code",
  "q": "Raise a ValueError with the message 'negative'.",
  "code": "",
  "accept": [
   "raise ValueError('negative')"
  ],
  "learn": "raise ExceptionClass(message); callers read the message with str(e)."
 }
];
