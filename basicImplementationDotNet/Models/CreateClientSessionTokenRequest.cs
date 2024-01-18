namespace BasicImplementationDotNet.Models;

public class CreateClientSessionTokenRequest
{
    public Customer Customer { get; set; }
    public PaymentDetails PaymentDetails { get; set; }
    public Amount Amount { get; set; }
    public string ClientTransactionUniqueReference { get; set; }
}

public class Customer
{
    public string CustomerId { get; set; }
    public string EmailAddress { get; set; }
    public BillingAddress BillingAddress { get; set; }
}
public class PaymentDetails
{
    public string CardType { get; set; }
    public string Description { get; set; }
    public bool SaveOnSuccess { get; set; }
    public string ClientPaymentTokenUniqueReference { get; set; }
}

public class Amount
{
    public string CurrencyAmount { get; set; }
}


public class BillingAddress
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PostalCode { get; set; }
    public List<string> Street { get; set; }
    public string CountryCode { get; set; }
    public string Suburb { get; set; }
    public string State { get; set; }
}