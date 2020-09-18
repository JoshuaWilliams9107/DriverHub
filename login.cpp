#include <cstdio>
#include <iostream>
#include <cstdlib>
#include <cstring>

using namespace std;

/* Logins have different tags for what kind of user
0 = driver
1 = sponsor
2 = admin
*/

int main (void) {

	int total_users = 3;
	int users[3][2] {{1234, 1000}, {2345, 2000}, {3456, 3000}};

	int user;
	int pass;
	cout << "Enter username: ";
	cin >> user;
	cout << "Enter password: ";
	cin >> pass;

	int login = 0; //becomes 1 on success

	for (int i=0; i<total_users; i++) {
		if(users[i][0] == user && users[i][1] == pass) {
			cout << "Login successful!" << endl;
			i=total_users;
			login=1;
		}
	}
	if (login == 0) {cout << "Username and password do not match" << endl;}
	return 1;
}

	
