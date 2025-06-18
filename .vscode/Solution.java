import java.io.*;
import java.util.*;

public class Solution {

    public static void main(String[] args) {
        Scanner sc= new Scanner(System.in);
        int a=sc.nextInt();
        int[] b=new int[a];
        for(int i=0;i<a+1;i++){
            b[i]=sc.nextInt();
            if (b[i]>-128&& b[i]<127){
                System.out.println("i"+b[i]);
            }
            else {
                System.out.println("NOT IN RANGE");
            }
        }
        
    }
}