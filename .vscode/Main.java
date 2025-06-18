class Node {
	int data;
	Node prev;
	Node next;
	Node(int d) {
		data=d;
		prev=null;
		next=null;
	}
}
class Dob {
	Node head =null;
	public void insertl(int data) {
		Node new_node=new Node(data);
		if(head==null) {
			head=new_node;
		}
		else {
			Node temp=head;
			while(temp.next!=null) {
				temp=temp.next;
			}
			temp.next=new_node;
			new_node.prev=temp;
		}
	}
	public void insertf(int data){
	    Node new_node=new Node(data);
	    if (head!=null){
	        new_node.next=head;
	        head.prev=new_node;
	    }
	    head=new_node;
	}
	public void display(){
	    Node temp=head;
	    while(temp!=null){
	        System.out.print(temp.data+"<=>");
	        temp=temp.next;
	    }
	    System.out.println();
	}
}
	public class Main
	{
		public static void main(String[] args) {
			Dob dll=new Dob();
			dll.insertl(10);
			dll.insertl(20);
			dll.insertl(30);
			dll.insertl(40);
			dll.display();
			
		}
	}