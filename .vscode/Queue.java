	class Node{
	    int data;
	    Node next;
	    Node (int d){
	        data=d;
	        next = null;
	       
	    }
	}
	public class Que{
	    Node rear=null,front=null;
	    void enqueues(int data){
	        if (front==null){
	            front=newNode;
	            rear=newNode;
	        }
	        else{
	            rear.next=newNode;
	            rear=rear.next;
	        }
	    }
	    int deque{
	        if(front!=null){
	            int d=front.data;
	            front=front.next;
	            if(front==null){
	                rear=null;
	            }
	            return d;
	        }
	        return -1;
	    }
	    int peak{
	        if(front!=null){
	            int d=front.data;
	            return d;
	        }
	        return -1;
	    }
	    boolean isEmpty(){
	        return(front==null){
	    }
	    int size(){
	        int count=0;
	        Node temp=front;
	        while (temp!=null){
	            count++;
	            temp=temp.next;
	        }
	        return count
	    }
	}
	public class Queue 
	{
		public static void main(String[] args) {
		    
		}
	}