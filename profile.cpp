#include <iostream>
#include <cstdio>
#include <cstring>

using namespace std;

int main (void) {

	string address = "12 Example Lane Albany, NY 12084";
	string company = "Driving Company";
	string firstname = "Human";
	string lastname = "Person";
	string email = "example@email.com";

	int i = 0;

	while(i!=6) {

		cout << "Edit Anything?" << endl;
		cout << "1. Address: " << address << endl;
		cout << "2. Company: " << company << endl;
		cout << "3. First Name: " << firstname << endl;
		cout << "4. Last Name: " << lastname << endl;
		cout << "5. E-Mail: " << email << endl;
		cout << "6. Done" << endl;

		cin >> i;

		//bugged will fix in next sprint
		if (i==1) {
			cout << "New Address: ";
			cin >> address;
		}

		if (i==2) {
			cout << "New Company: ";
			cin >> company;
		}

		if (i==3) {
			cout << "New First Name: ";
			cin >> firstname;
		}

		if (i==4) {
			cout << "New Last Name: ";
			cin >> lastname;
		}

		if (i==5) {
			cout << "New E-Mail: ";
			cin >> email;
		}

		if (i==6) {
			cout << "New Address: ";
			cout << "Saved!";
		}
	}

	return 1;
}
